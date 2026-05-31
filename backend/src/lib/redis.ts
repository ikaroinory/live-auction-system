import Redis from 'ioredis'
import config from '../config'

const {
  host,
  port,
  password,
  db,
  timeout,
  maxConnections: _maxConnections,
  keyPrefix
} = config.redis

const redisClient = new Redis({
  host,
  port,
  password: password || undefined,
  db,
  connectTimeout: timeout,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  connectionName: 'auction-service',
  keyPrefix
})

const subscriberClient = new Redis({
  host,
  port,
  password: password || undefined,
  db,
  connectTimeout: timeout,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  connectionName: 'auction-subscriber'
})

redisClient.on('connect', () => {
  console.log(`✅ Redis 连接成功: ${host}:${port}`)
})

redisClient.on('ready', () => {
  console.log('✅ Redis 客户端已准备就绪')
})

redisClient.on('error', (error: Error) => {
  console.error('❌ Redis 连接错误:', error.message)
})

redisClient.on('close', () => {
  console.log('🔌 Redis 连接已关闭')
})

redisClient.on('reconnecting', (delay: number) => {
  console.log(`🔄 Redis 正在重新连接，延迟: ${delay}ms`)
})

subscriberClient.on('connect', () => {
  console.log(`✅ Redis 订阅客户端连接成功: ${host}:${port}`)
})

subscriberClient.on('error', (error: Error) => {
  console.error('❌ Redis 订阅客户端错误:', error.message)
})

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect()
    await subscriberClient.connect()
    await redisClient.config('SET', 'notify-keyspace-events', 'Ex')
    console.log('✅ Redis 键过期通知已启用')
  } catch (error) {
    console.error('❌ Redis 连接失败:', error)
    throw error
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.quit()
    await subscriberClient.quit()
    console.log('✅ Redis 连接已断开')
  } catch (error) {
    console.error('❌ Redis 断开连接失败:', error)
  }
}

export { redisClient, subscriberClient }

export const REDIS_KEYS = {
  AUCTION_EXPIRE: (productId: string) => `expire:product:${productId}`,
  AUCTION_CURRENT_PRICE: (productId: string) => `price:product:${productId}`,
  AUCTION_BID_COUNT: (productId: string) => `bids:product:${productId}`
}
