import { Queue, Worker, QueueEvents, Job, QueueOptions, WorkerOptions } from 'bullmq'
import config from '../config'

const { host, port, password, db } = config.redis

const redisConnection: QueueOptions['connection'] = {
  host,
  port,
  password: password || undefined,
  db,
  maxRetriesPerRequest: 3,
  lazyConnect: true
}

export const QUEUE_NAMES = {
  AUCTION_EXPIRE: 'auction_expire'
}

export interface AuctionExpireJobData {
  productId: string
  auctionId: string
}

export interface AuctionExpireJob extends Job<AuctionExpireJobData> {}

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      count: 1000,
      age: 86400000
    },
    removeOnFail: {
      count: 500,
      age: 604800000
    }
  }
}

const workerOptions: WorkerOptions = {
  connection: redisConnection,
  concurrency: 5,
  lockDuration: 30000,
  lockRenewTime: 15000,
  maxStalledCount: 2,
  stalledInterval: 30000
}

export const auctionExpireQueue = new Queue<AuctionExpireJobData>(
  QUEUE_NAMES.AUCTION_EXPIRE,
  queueOptions
)

export function createAuctionExpireWorker(
  processor: (job: AuctionExpireJob) => Promise<void>
): Worker<AuctionExpireJobData> {
  const worker = new Worker<AuctionExpireJobData>(
    QUEUE_NAMES.AUCTION_EXPIRE,
    processor,
    workerOptions
  )

  worker.on('ready', () => {
    console.log('✅ BullMQ Worker 已准备就绪')
  })

  worker.on('error', (error) => {
    console.error('❌ BullMQ Worker 错误:', error)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ 任务执行失败: jobId=${job?.id}, productId=${job?.data.productId}, 错误:`, err)
  })

  worker.on('completed', (job) => {
    console.log(`✅ 任务执行完成: jobId=${job.id}, productId=${job.data.productId}`)
  })

  worker.on('drained', () => {
    console.log('📭 BullMQ Worker 队列为空')
  })

  return worker
}

export const queueEvents = new QueueEvents(QUEUE_NAMES.AUCTION_EXPIRE, {
  connection: redisConnection
})

queueEvents.on('waiting', ({ jobId }) => {
  console.log(`📨 任务进入等待队列: jobId=${jobId}`)
})

queueEvents.on('active', ({ jobId }) => {
  console.log(`🔄 任务开始执行: jobId=${jobId}`)
})

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`✅ 任务完成: jobId=${jobId}, 返回值:`, returnvalue)
})

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ 任务失败: jobId=${jobId}, 原因: ${failedReason}`)
})

queueEvents.on('delayed', ({ jobId, delay }) => {
  console.log(`⏰ 任务延迟执行: jobId=${jobId}, 延迟: ${delay}ms`)
})

export async function addAuctionExpireJob(
  data: AuctionExpireJobData,
  delay: number
): Promise<Job<AuctionExpireJobData>> {
  const jobId = `auction_${data.productId}`

  try {
    const existingJob = await auctionExpireQueue.getJob(jobId)
    if (existingJob) {
      await existingJob.remove()
      console.log(`🔄 已移除旧的竞拍到期任务: jobId=${jobId}`)
    }

    const job = await auctionExpireQueue.add('expire', data, {
      jobId,
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    })
    console.log(
      `📅 已创建竞拍到期任务: jobId=${job.id}, productId=${data.productId}, 延迟: ${delay}ms`
    )
    return job
  } catch (error) {
    console.error(`❌ 创建竞拍到期任务失败: productId=${data.productId}`, error)
    throw error
  }
}

export async function removeAuctionExpireJob(productId: string): Promise<void> {
  const jobId = `auction_${productId}`
  try {
    const job = await auctionExpireQueue.getJob(jobId)
    if (job) {
      await job.remove()
      console.log(`🗑️ 已移除竞拍到期任务: jobId=${jobId}`)
    }
  } catch (error) {
    console.error(`❌ 移除竞拍到期任务失败: productId=${productId}`, error)
    throw error
  }
}

export async function getJobStatus(productId: string): Promise<string | null> {
  const jobId = `auction_${productId}`
  try {
    const job = await auctionExpireQueue.getJob(jobId)
    if (!job) {
      return null
    }
    return await job.getState()
  } catch (error) {
    console.error(`❌ 获取任务状态失败: productId=${productId}`, error)
    return null
  }
}

export async function getQueueStats(): Promise<{
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}> {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      auctionExpireQueue.count(),
      auctionExpireQueue.getActiveCount(),
      auctionExpireQueue.getCompletedCount(),
      auctionExpireQueue.getFailedCount(),
      auctionExpireQueue.getDelayedCount()
    ])
    return { waiting, active, completed, failed, delayed }
  } catch (error) {
    console.error('❌ 获取队列统计失败', error)
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
  }
}

export async function closeQueue(): Promise<void> {
  try {
    await auctionExpireQueue.close()
    console.log('✅ BullMQ Queue 已关闭')
  } catch (error) {
    console.error('❌ 关闭队列失败', error)
  }
}
