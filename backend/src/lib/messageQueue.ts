import { redisClient } from './redis'

export const QUEUE_NAMES = {
  AUCTION_END: 'queue:auction:end',
  AUCTION_END_PROCESSING: 'queue:auction:end:processing',
  AUCTION_END_FAILED: 'queue:auction:end:failed'
}

export interface AuctionEndMessage {
  auctionId: string
  productId?: string
  timestamp: string
  retryCount: number
}

export async function enqueueMessage(queueName: string, message: AuctionEndMessage): Promise<void> {
  try {
    const messageStr = JSON.stringify(message)
    await redisClient.rpush(queueName, messageStr)
    console.log(`📨 消息已加入队列: ${queueName}, auctionId=${message.auctionId}`)
  } catch (error) {
    console.error(`❌ 加入队列失败: ${queueName}`, error)
    throw error
  }
}

export async function dequeueMessage(
  queueName: string,
  processingQueueName: string
): Promise<AuctionEndMessage | null> {
  try {
    const result = await redisClient.rpoplpush(queueName, processingQueueName)
    if (!result) {
      return null
    }
    const message = JSON.parse(result) as AuctionEndMessage
    console.log(`📬 消息已取出处理: auctionId=${message.auctionId}`)
    return message
  } catch (error) {
    console.error(`❌ 取出消息失败: ${queueName}`, error)
    throw error
  }
}

export async function acknowledgeMessage(
  processingQueueName: string,
  message: AuctionEndMessage
): Promise<void> {
  try {
    const messageStr = JSON.stringify(message)
    await redisClient.lrem(processingQueueName, 1, messageStr)
    console.log(`✅ 消息处理完成: auctionId=${message.auctionId}`)
  } catch (error) {
    console.error(`❌ 确认消息失败: ${processingQueueName}`, error)
    throw error
  }
}

export async function requeueMessage(
  processingQueueName: string,
  queueName: string,
  message: AuctionEndMessage,
  maxRetries: number = 3
): Promise<boolean> {
  try {
    const messageStr = JSON.stringify(message)
    await redisClient.lrem(processingQueueName, 1, messageStr)

    if (message.retryCount >= maxRetries) {
      await redisClient.rpush(QUEUE_NAMES.AUCTION_END_FAILED, messageStr)
      console.error(`❌ 消息达到最大重试次数，移入失败队列: auctionId=${message.auctionId}`)
      return false
    }

    message.retryCount += 1
    const updatedMessageStr = JSON.stringify(message)
    await redisClient.rpush(queueName, updatedMessageStr)
    console.log(
      `🔄 消息已重新入队: auctionId=${message.auctionId}, retryCount=${message.retryCount}`
    )
    return true
  } catch (error) {
    console.error(`❌ 重新入队失败: ${processingQueueName}`, error)
    throw error
  }
}

export async function getQueueLength(queueName: string): Promise<number> {
  try {
    return await redisClient.llen(queueName)
  } catch (error) {
    console.error(`❌ 获取队列长度失败: ${queueName}`, error)
    return 0
  }
}

export async function getFailedMessages(): Promise<AuctionEndMessage[]> {
  try {
    const messages = await redisClient.lrange(QUEUE_NAMES.AUCTION_END_FAILED, 0, -1)
    return messages.map((m) => JSON.parse(m) as AuctionEndMessage)
  } catch (error) {
    console.error(`❌ 获取失败消息失败`, error)
    return []
  }
}

export async function clearQueue(queueName: string): Promise<void> {
  try {
    await redisClient.del(queueName)
    console.log(`🗑️ 队列已清空: ${queueName}`)
  } catch (error) {
    console.error(`❌ 清空队列失败: ${queueName}`, error)
    throw error
  }
}
