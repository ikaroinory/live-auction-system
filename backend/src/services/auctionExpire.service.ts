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

interface AuctionSettlementResult {
  auctionId: string
  winnerId: string | null
  finalPrice: number
  status: 'success' | 'failed' | 'no_bids'
  orderId?: string
}

export async function settleAuction(auctionId: string): Promise<AuctionSettlementResult> {
  console.log(`⏰ 开始结算竞拍: ${auctionId}`)

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        orderBy: { price: 'desc' },
        take: 1,
        include: { user: true }
      },
      product: true
    }
  })

  if (!auction) {
    console.warn(`⚠️ 竞拍不存在: ${auctionId}`)
    return {
      auctionId,
      winnerId: null,
      finalPrice: 0,
      status: 'failed'
    }
  }

  if (auction.status !== 1) {
    console.warn(`⚠️ 竞拍状态不是进行中: ${auctionId}, 当前状态: ${auction.status}`)
    return {
      auctionId,
      winnerId: null,
      finalPrice: 0,
      status: 'failed'
    }
  }

  let finalPrice = auction.startPrice
  let winnerId: string | null = null

  if (auction.bids.length > 0) {
    finalPrice = auction.bids[0].price
    winnerId = auction.bids[0].userId
    console.log(`🏆 竞拍 ${auctionId} 获胜者: ${winnerId}, 最终价格: ${finalPrice}`)
  } else {
    console.log(`📭 竞拍 ${auctionId} 无人出价`)
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.auction.update({
      where: { id: auctionId },
      data: {
        status: 2,
        endTime: now,
        finalPrice,
        winnerId
      }
    })

    if (winnerId) {
      const existingOrder = await tx.order.findUnique({
        where: { auctionId }
      })

      if (!existingOrder) {
        await tx.order.create({
          data: {
            auctionId,
            userId: winnerId,
            sellerId: auction.sellerId,
            finalPrice,
            status: 0
          }
        })
        console.log(`📝 已创建订单: auctionId=${auctionId}, userId=${winnerId}`)
      } else {
        console.log(`📋 订单已存在: auctionId=${auctionId}`)
      }
    }

    if (auction.product) {
      await tx.product.update({
        where: { id: auction.product.id },
        data: {
          auctionStatus: 'ENDED',
          auctionEndTime: now,
          currentBidPrice: finalPrice
        }
      })
    }
  })

  await updateAuctionStatusInRedis(auctionId, 'ended', {
    winnerId,
    finalPrice: Number(finalPrice)
  })

  console.log(`✅ 竞拍 ${auctionId} 结算完成`)

  return {
    auctionId,
    winnerId,
    finalPrice: Number(finalPrice),
    status: winnerId ? 'success' : 'no_bids'
  }
}

export async function handleAuctionExpire(auctionId: string): Promise<void> {
  try {
    console.log(`🔔 收到竞拍到期通知: ${auctionId}`)

    const message: AuctionEndMessage = {
      auctionId,
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    await enqueueMessage(QUEUE_NAMES.AUCTION_END, message)
  } catch (error) {
    console.error(`❌ 处理竞拍到期失败: ${auctionId}`, error)
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
        await settleAuction(message.auctionId)
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

        if (unprefixedKey.startsWith('expire:')) {
          const auctionId = unprefixedKey.replace('expire:', '')
          try {
            await handleAuctionExpire(auctionId)
          } catch (error) {
            console.error(`❌ 处理竞拍到期异常: ${auctionId}`, error)
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

export async function setAuctionExpire(
  auctionId: string,
  durationSeconds: number,
  productInfo?: {
    productId: string
    name: string
    startPrice: number
    sellerId: string
  }
): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)

    await redisClient.hset(key, 'auctionId', auctionId)
    await redisClient.hset(key, 'status', 'active')
    await redisClient.hset(key, 'startTime', new Date().toISOString())

    if (productInfo) {
      await redisClient.hset(key, 'productId', productInfo.productId)
      await redisClient.hset(key, 'productName', productInfo.name)
      await redisClient.hset(key, 'startPrice', String(productInfo.startPrice))
      await redisClient.hset(key, 'sellerId', productInfo.sellerId)
    }

    await redisClient.expire(key, durationSeconds)
    console.log(`⏱️ 已设置竞拍过期时间: ${auctionId}, 时长: ${durationSeconds}秒`)
  } catch (error) {
    console.error(`❌ 设置竞拍过期时间失败: ${auctionId}`, error)
    throw error
  }
}

export async function extendAuctionExpire(auctionId: string, extendSeconds: number): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)
    const ttl = await redisClient.ttl(key)

    if (ttl === -2) {
      console.warn(`⚠️ 竞拍键不存在: ${auctionId}`)
      return
    }

    const newTtl = Math.max(0, ttl) + extendSeconds
    await redisClient.expire(key, newTtl)
    console.log(
      `⏰ 已延长竞拍时间: ${auctionId}, 新增时长: ${extendSeconds}秒, 剩余时长: ${newTtl}秒`
    )
  } catch (error) {
    console.error(`❌ 延长竞拍时间失败: ${auctionId}`, error)
    throw error
  }
}

export async function removeAuctionExpire(auctionId: string): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)
    await redisClient.del(key)
    console.log(`🗑️ 已删除竞拍过期键: ${auctionId}`)
  } catch (error) {
    console.error(`❌ 删除竞拍过期键失败: ${auctionId}`, error)
    throw error
  }
}

export async function getAuctionStatusFromRedis(auctionId: string): Promise<{
  status: string
  auctionId: string
  productId?: string
  productName?: string
  startPrice?: number
  winnerId?: string
  finalPrice?: number
} | null> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)
    const exists = await redisClient.exists(key)

    if (!exists) {
      return null
    }

    const data = await redisClient.hgetall(key)
    return {
      status: data.status || 'unknown',
      auctionId: data.auctionId || auctionId,
      productId: data.productId,
      productName: data.productName,
      startPrice: data.startPrice ? Number(data.startPrice) : undefined,
      winnerId: data.winnerId,
      finalPrice: data.finalPrice ? Number(data.finalPrice) : undefined
    }
  } catch (error) {
    console.error(`❌ 获取竞拍状态失败: ${auctionId}`, error)
    return null
  }
}

export async function updateAuctionStatusInRedis(
  auctionId: string,
  status: string,
  extraData?: { winnerId?: string; finalPrice?: number }
): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)
    await redisClient.hset(key, 'status', status)

    if (extraData) {
      if (extraData.winnerId) {
        await redisClient.hset(key, 'winnerId', extraData.winnerId)
      }
      if (extraData.finalPrice) {
        await redisClient.hset(key, 'finalPrice', String(extraData.finalPrice))
      }
    }

    console.log(`📊 已更新竞拍状态: ${auctionId}, status=${status}`)
  } catch (error) {
    console.error(`❌ 更新竞拍状态失败: ${auctionId}`, error)
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
