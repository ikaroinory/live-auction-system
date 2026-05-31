import { prisma } from '../lib/prisma'
import { redisClient, subscriberClient, REDIS_KEYS } from '../lib/redis'
import config from '../config'

const { keyPrefix } = config.redis

export async function handleAuctionExpire(auctionId: string): Promise<void> {
  try {
    console.log(`⏰ 处理竞拍到期: ${auctionId}`)

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { price: 'desc' },
          take: 1,
          include: { user: true }
        }
      }
    })

    if (!auction) {
      console.warn(`⚠️ 竞拍不存在: ${auctionId}`)
      return
    }

    if (auction.status !== 1) {
      console.warn(`⚠️ 竞拍状态不是进行中，跳过处理: ${auctionId}, 当前状态: ${auction.status}`)
      return
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

    await prisma.auction.update({
      where: { id: auctionId },
      data: {
        status: 2,
        endTime: now,
        finalPrice,
        winnerId
      }
    })

    if (winnerId) {
      await prisma.order.create({
        data: {
          auctionId,
          userId: winnerId,
          sellerId: auction.sellerId,
          finalPrice,
          status: 0
        }
      })
      console.log(`📝 已创建订单: auctionId=${auctionId}, userId=${winnerId}`)
    }

    console.log(`✅ 竞拍 ${auctionId} 已成功结束`)
  } catch (error) {
    console.error(`❌ 处理竞拍到期失败: ${auctionId}`, error)
    throw error
  }
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

        // 移除键前缀，检查是否是我们的竞拍过期键
        const unprefixedKey = key.startsWith(keyPrefix) ? key.slice(keyPrefix.length) : key

        if (unprefixedKey.startsWith('expire:')) {
          const auctionId = unprefixedKey.replace('expire:', '')
          console.log(`🔔 收到竞拍到期通知: ${auctionId}`)

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

    console.log('✅ 竞拍到期监听器已启动')
  } catch (error) {
    console.error('❌ 启动竞拍到期监听器失败:', error)
    throw error
  }
}

export async function setAuctionExpire(auctionId: string, durationSeconds: number): Promise<void> {
  try {
    const key = REDIS_KEYS.AUCTION_EXPIRE(auctionId)
    await redisClient.set(key, auctionId, 'EX', durationSeconds)
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
