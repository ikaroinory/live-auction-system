import { prisma } from '../lib/prisma'
import {
  createAuctionExpireWorker,
  addAuctionExpireJob,
  removeAuctionExpireJob,
  getJobStatus,
  getQueueStats,
  closeQueue,
  AuctionExpireJob,
  AuctionExpireJobData
} from '../lib/bullmq'

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
      auctionEndTime: now,
      status: 2
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
      const order = await prisma.order.create({
        data: {
          auctionId: auction.id,
          userId: winnerId,
          sellerId: product.creatorId,
          finalPrice,
          status: 0
        }
      })
      console.log(`📝 已创建订单: orderId=${order.id}, productId=${productId}, userId=${winnerId}`)

      return {
        productId,
        winnerId,
        finalPrice: Number(finalPrice),
        status: 'success',
        orderId: order.id
      }
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
    if (auction) {
      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: 2,
          endTime: now,
          finalPrice: product.startingPrice,
          winnerId: null
        }
      })
    }
  }

  console.log(`✅ 商品竞拍 ${productId} 结算完成`)

  return {
    productId,
    winnerId,
    finalPrice: Number(finalPrice),
    status: winnerId ? 'success' : 'no_bids'
  }
}

export async function auctionExpireProcessor(job: AuctionExpireJob): Promise<void> {
  const { productId, auctionId } = job.data
  console.log(`🔔 处理竞拍到期任务: productId=${productId}, auctionId=${auctionId}`)

  await settleProductAuction(productId)
}

export async function scheduleAuctionExpire(
  productId: string,
  auctionId: string,
  endTime: Date
): Promise<void> {
  const now = new Date()
  const delay = endTime.getTime() - now.getTime()

  if (delay <= 0) {
    console.warn(`⚠️ 竞拍结束时间已过，立即处理: productId=${productId}`)
    await settleProductAuction(productId)
    return
  }

  const jobData: AuctionExpireJobData = {
    productId,
    auctionId
  }

  await addAuctionExpireJob(jobData, delay)
}

export async function cancelAuctionExpire(productId: string): Promise<void> {
  await removeAuctionExpireJob(productId)
}

export async function getAuctionExpireStatus(productId: string): Promise<string | null> {
  return getJobStatus(productId)
}

export async function startAuctionExpireWorker(): Promise<void> {
  createAuctionExpireWorker(auctionExpireProcessor)
  console.log('✅ 竞拍到期Worker已启动')
}

export async function stopAuctionExpireWorker(): Promise<void> {
  await closeQueue()
  console.log('🛑 竞拍到期Worker已停止')
}

export { getQueueStats }