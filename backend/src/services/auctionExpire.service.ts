import { prisma } from '../lib/prisma'
import { redisClient, subscriberClient, REDIS_KEYS } from '../lib/redis'
import {
  QUEUE_NAMES,
  AuctionEndMessage,
  enqueueMessage,
  dequeueMessage,
  acknowledgeMessage,
  requeueMessage,
  getQueueLength
} from '../lib/messageQueue'
import config from '../config'

const { keyPrefix } = config.redis

const MAX_RETRIES = 3
const PROCESSING_INTERVAL = 1000
let isProcessing = true

interface ProductSettlementResult {
  productId: string
  winnerId: string | null
  finalPrice: number
  status: 'success' | 'failed' | 'no_bids'
  orderId?: string
}

export async function settleProductAuction(productId: string): Promise<ProductSettlementResult> {
  console.log(`⏰ 开始结算商品竞拍: ${productId}`)

  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) {
    console.warn(`⚠️ 商品不存在: ${productId}`)
    return {
      productId,
      winnerId: null,
      finalPrice: 0,
      status: 'failed'
    }
  }

  if (product.auctionStatus !== 'IN_PROGRESS') {
    console.warn(`⚠️ 商品竞拍状态不是进行中: ${productId}, 当前状态: ${product.auctionStatus}`)
    return {
      productId,
      winnerId: null,
      finalPrice: 0,
      status: 'failed'
    }
  }

  const now = new Date()

  await prisma.product.update({
    where: { id: productId },
    data: {
      auctionStatus: 'ENDED',
      auctionEndTime: now
    }
  })

  const auction = await prisma.auction.findFirst({
    where: {
      productId: productId,
      status: 1
    },
    include: {
      bids: {
        orderBy: { price: 'desc' },
        take: 1
      }
    }
  })

  let finalPrice = product.currentBidPrice || product.startingPrice
  let winnerId: string | null = null

  if (auction && auction.bids.length > 0) {
    finalPrice = auction.bids[0].price
    winnerId = auction.bids[0].userId
    console.log(`🏆 商品竞拍 ${productId} 获胜者: ${winnerId}, 最终价格: ${finalPrice}`)

    if (winnerId) {
      await prisma.order.create({
        data: {
          auctionId: auction.id,
          userId: winnerId,
          sellerId: product.creatorId,
          finalPrice,
          status: 0
        }
      })
      console.log(`📝 已创建订单: productId=${productId}, userId=${winnerId}`)
    }

    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        status: 2,
        endTime: now,
        finalPrice,
        winnerId
      }
    })
  } else {
    console.log(`📭 商品竞拍 ${productId} 无人出价`)
  }

  await removeAuctionProductInfo(productId)

  console.log(`✅ 商品竞拍 ${productId} 结算完成`)

  return {
    productId,
    winnerId,
    finalPrice: Number(finalPrice),
    status: winnerId ? 'success' : 'no_bids'
  }
}

export async function handleAuctionExpire(productId: string): Promise<void> {
  try {
    console.log(`🔔 收到竞拍到期通知: ${productId}`)

    const message: AuctionEndMessage = {
      auctionId: productId,
      productId,
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    await enqueueMessage(QUEUE_NAMES.AUCTION_END, message)
  } catch (error) {
    console.error(`❌ 处理竞拍到期失败: ${productId}`, error)
    throw error
  }
}

export async function processAuctionEndQueue(): Promise<void> {
  console.log('🔄 开始处理竞拍结束队列')

  while (isProcessing) {
    try {
      const message = await dequeueMessage(
        QUEUE_NAMES.AUCTION_END,
        QUEUE_NAMES.AUCTION_END_PROCESSING
      )

      if (!message) {
        await new Promise((resolve) => setTimeout(resolve, PROCESSING_INTERVAL))
        continue
      }

      try {
        await settleProductAuction(message.auctionId)
        await acknowledgeMessage(QUEUE_NAMES.AUCTION_END_PROCESSING, message)
      } catch (error) {
        console.error(`❌ 结算失败: ${message.auctionId}`, error)
        await requeueMessage(
          QUEUE_NAMES.AUCTION_END_PROCESSING,
          QUEUE_NAMES.AUCTION_END,
          message,
          MAX_RETRIES
        )
      }
    } catch (error) {
      console.error('❌ 队列处理异常:', error)
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_INTERVAL * 5))
    }
  }
}

export function stopProcessing(): void {
  isProcessing = false
  console.log('🛑 队列处理已停止')
}

export async function startExpireListener(): Promise<void> {
  try {
    const expiredKeyPattern = '__keyevent@0__:expired'

    subscriberClient.subscribe(expiredKeyPattern, (err, count) => {
      if (err) {
        console.error('❌ 订阅键过期事件失败:', err)
        return
      }
      console.log(`✅ 已订阅键过期事件频道，当前订阅数: ${count}`)
    })

    subscriberClient.on('message', async (channel, message) => {
      if (channel === '__keyevent@0__:expired') {
        const key = message
        console.log(`📨 收到过期键通知: ${key}`)

        const unprefixedKey = key.startsWith(keyPrefix) ? key.slice(keyPrefix.length) : key

        if (unprefixedKey.startsWith('expire:product:')) {
          const productId = unprefixedKey.replace('expire:product:', '')
          try {
            await handleAuctionExpire(productId)
          } catch (error) {
            console.error(`❌ 处理竞拍到期异常: ${productId}`, error)
          }
        }
      }
    })

    subscriberClient.on('subscribe', (channel, count) => {
      console.log(`📡 已订阅频道: ${channel}, 当前订阅数: ${count}`)
    })

    subscriberClient.on('error', (error) => {
      console.error('❌ Redis订阅客户端错误:', error)
    })

    processAuctionEndQueue().catch((error) => {
      console.error('❌ 队列处理启动失败:', error)
    })

    console.log('✅ 竞拍到期监听器已启动')
  } catch (error) {
    console.error('❌ 启动竞拍到期监听器失败:', error)
    throw error
  }
}

export async function setAuctionProductInfo(
  productId: string,
  info: {
    name: string
    currentPrice: number
    bidCount: number
    startPrice: number
    minIncrement: number
    endTime: Date
    sellerId: string
  },
  expireSeconds: number
): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(productId)
    const productInfo = {
      ...info,
      productId,
      createdAt: new Date().toISOString()
    }
    await redisClient.hset(key, 'info', JSON.stringify(productInfo))
    await redisClient.expire(key, expireSeconds)
    console.log(`✅ 竞拍商品信息已写入Redis: ${productId}`)
  } catch (error) {
    console.error(`❌ 写入竞拍商品信息失败: ${productId}`, error)
  }
}

export async function removeAuctionProductInfo(productId: string): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(productId)
    await redisClient.del(key)
    console.log(`✅ 竞拍商品信息已从Redis删除: ${productId}`)
  } catch (error) {
    console.error(`❌ 删除竞拍商品信息失败: ${productId}`, error)
  }
}

export async function extendAuctionExpire(productId: string, extendSeconds: number): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(productId)
    const ttl = await redisClient.ttl(key)

    if (ttl === -2) {
      console.warn(`⚠️ 竞拍键不存在: ${productId}`)
      return
    }

    const newTtl = Math.max(0, ttl) + extendSeconds
    await redisClient.expire(key, newTtl)
    console.log(
      `⏰ 已延长竞拍时间: ${productId}, 新增时长: ${extendSeconds}秒, 剩余时长: ${newTtl}秒`
    )
  } catch (error) {
    console.error(`❌ 延长竞拍时间失败: ${productId}`, error)
    throw error
  }
}

export async function getAuctionProductInfo(productId: string): Promise<{
  productId: string
  name: string
  currentPrice: number
  bidCount: number
  startPrice: number
  minIncrement: number
  endTime: string
  sellerId: string
  createdAt: string
} | null> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(productId)
    const infoStr = await redisClient.hget(key, 'info')

    if (!infoStr) {
      return null
    }

    return JSON.parse(infoStr)
  } catch (error) {
    console.error(`❌ 获取竞拍商品信息失败: ${productId}`, error)
    return null
  }
}

export async function getQueueStats(): Promise<{
  pending: number
  processing: number
  failed: number
}> {
  return {
    pending: await getQueueLength(QUEUE_NAMES.AUCTION_END),
    processing: await getQueueLength(QUEUE_NAMES.AUCTION_END_PROCESSING),
    failed: await getQueueLength(QUEUE_NAMES.AUCTION_END_FAILED)
  }
}
