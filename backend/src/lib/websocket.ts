import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { prisma } from './prisma'
import { redisClient } from './redis'
import {
  WebSocketMessage,
  JoinRoomPayload,
  BidPayload,
  PriceUpdatePayload,
  RankingUpdatePayload,
  CountdownTickPayload,
  AuctionEndPayload,
  BidSuccessPayload,
  BidFailedPayload,
  AuctionExtendedPayload
} from '@live-auction/shared'

interface AuctionRoom {
  productId: string
  currentPrice: number
  endTime: number
  bidders: Set<string>
  timer: ReturnType<typeof setInterval> | null
}

const rooms = new Map<string, AuctionRoom>()
let ioInstance: Server | null = null

function createMessage<T>(type: string, payload: T): WebSocketMessage<T> {
  return {
    type,
    payload,
    timestamp: Date.now()
  }
}

export function getIO(): Server | null {
  return ioInstance
}

export function setupWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  ioInstance = io

  io.on('connection', (socket: Socket) => {
    console.log(`WebSocket client connected: ${socket.id}`)

    socket.on('JOIN_ROOM', async (payload: JoinRoomPayload) => {
      try {
        const { productId, userId } = payload

        const product = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!product) {
          socket.emit('JOIN_ROOM_FAILED', createMessage('JOIN_ROOM_FAILED', {
            productId,
            reason: '商品不存在'
          }))
          return
        }

        let room = rooms.get(productId)

        if (!room) {
          const currentPrice = product.currentBidPrice || product.startingPrice
          const endTime = product.auctionEndTime ? product.auctionEndTime.getTime() : Date.now() + product.durationMinutes * 60 * 1000

          room = {
            productId,
            currentPrice,
            endTime,
            bidders: new Set(),
            timer: null
          }

          rooms.set(productId, room)

          startAuctionTimer(productId, room)
        }

        room.bidders.add(userId)
        socket.join(productId)

        socket.emit('JOIN_ROOM_SUCCESS', createMessage('JOIN_ROOM_SUCCESS', {
          productId,
          currentPrice: room.currentPrice,
          remainingMs: Math.max(0, room.endTime - Date.now())
        }))

        const rankings = await getRankings(productId)
        socket.emit('RANKING_UPDATE', createMessage('RANKING_UPDATE', {
          auctionId: productId,
          rankings
        }))

      } catch (error) {
        console.error('JOIN_ROOM error:', error)
        socket.emit('JOIN_ROOM_FAILED', createMessage('JOIN_ROOM_FAILED', {
          productId: payload.productId,
          reason: '服务器错误'
        }))
      }
    })

    socket.on('LEAVE_ROOM', (payload: JoinRoomPayload) => {
      const { productId, userId } = payload
      const room = rooms.get(productId)

      if (room) {
        room.bidders.delete(userId)
        socket.leave(productId)

        if (room.bidders.size === 0) {
          if (room.timer) {
            clearInterval(room.timer)
          }
          rooms.delete(productId)
        }
      }
    })

    socket.on('SUBMIT_BID', async (payload: BidPayload) => {
      try {
        const { productId, userId, price } = payload
        const room = rooms.get(productId)

        if (!room) {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: '竞拍房间不存在'
          }))
          return
        }

        const product = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!product) {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: '商品不存在'
          }))
          return
        }

        if (product.auctionStatus !== 'IN_PROGRESS') {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: '竞拍未在进行中'
          }))
          return
        }

        const currentPrice = room.currentPrice
        const minNextPrice = currentPrice + Number(product.fixedIncrement)

        if (price < minNextPrice) {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: `出价必须高于 ${minNextPrice}`
          }))
          return
        }

        if (product.maxPrice && price > Number(product.maxPrice)) {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: `出价不能超过最高价 ${product.maxPrice}`
          }))
          return
        }

        const lockKey = `auction:lock:${productId}`
        const lock = await redisClient.set(lockKey, userId, 'NX', 'PX', 1000)

        if (!lock) {
          socket.emit('BID_FAILED', createMessage('BID_FAILED', {
            auctionId: productId,
            userId,
            reason: '系统繁忙，请稍后重试'
          }))
          return
        }

        try {
          const updatedProduct = await prisma.product.findUnique({
            where: { id: productId }
          })

          if (!updatedProduct || updatedProduct.auctionStatus !== 'IN_PROGRESS') {
            socket.emit('BID_FAILED', createMessage('BID_FAILED', {
              auctionId: productId,
              userId,
              reason: '竞拍已结束'
            }))
            return
          }

          const actualCurrentPrice = updatedProduct.currentBidPrice || updatedProduct.startingPrice

          if (price <= Number(actualCurrentPrice)) {
            socket.emit('BID_FAILED', createMessage('BID_FAILED', {
              auctionId: productId,
              userId,
              reason: '出价必须高于当前价格'
            }))
            return
          }

          const bid = await prisma.bid.create({
            data: {
              productId,
              userId,
              price
            },
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true
                }
              }
            }
          })

          room.currentPrice = price

          await prisma.product.update({
            where: { id: productId },
            data: {
              currentBidPrice: price,
              bidCount: { increment: 1 }
            }
          })

          room.endTime = Date.now() + updatedProduct.extendSeconds * 1000 + 1000

          socket.emit('BID_SUCCESS', createMessage('BID_SUCCESS', {
            auctionId: productId,
            userId,
            price,
            username: bid.user?.nickname || bid.user?.phone
          } as BidSuccessPayload))

          const priceUpdate: PriceUpdatePayload = {
            auctionId: productId,
            currentPrice: price,
            bidderId: userId,
            bidderName: bid.user?.nickname || bid.user?.phone || '匿名用户'
          }
          io.to(productId).emit('PRICE_UPDATE', createMessage('PRICE_UPDATE', priceUpdate))

          const rankings = await getRankings(productId)
          const rankingUpdate: RankingUpdatePayload = {
            auctionId: productId,
            rankings
          }
          io.to(productId).emit('RANKING_UPDATE', createMessage('RANKING_UPDATE', rankingUpdate))

        } finally {
          await redisClient.del(lockKey)
        }

      } catch (error) {
        console.error('SUBMIT_BID error:', error)
        socket.emit('BID_FAILED', createMessage('BID_FAILED', {
          auctionId: payload.productId,
          userId: payload.userId,
          reason: '服务器错误'
        } as BidFailedPayload))
      }
    })

    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`)
    })
  })

  return io
}

async function getRankings(productId: string): Promise<RankingUpdatePayload['rankings']> {
  const bids = await prisma.bid.findMany({
    where: { productId },
    orderBy: { price: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          phone: true
        }
      }
    }
  })

  return bids.map((bid, index) => ({
    userId: bid.userId,
    username: bid.user?.nickname || bid.user?.phone,
    phone: bid.user?.phone,
    price: Number(bid.price),
    rank: index + 1
  }))
}

function startAuctionTimer(productId: string, room: AuctionRoom): void {
  if (room.timer) {
    clearInterval(room.timer)
  }

  room.timer = setInterval(async () => {
    const now = Date.now()
    const remainingMs = room.endTime - now

    if (remainingMs <= 0) {
      if (room.timer) {
        clearInterval(room.timer)
      }

      await endAuction(productId)
      rooms.delete(productId)
      return
    }

    const tickPayload: CountdownTickPayload = {
      auctionId: productId,
      remainingMs
    }
    const io = getIO()
    io?.to(productId).emit('COUNTDOWN_TICK', createMessage('COUNTDOWN_TICK', tickPayload))

  }, 1000)
}

async function endAuction(productId: string): Promise<void> {
  const io = getIO()

  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) return

  const winningBid = await prisma.bid.findFirst({
    where: { productId },
    orderBy: { price: 'desc' }
  })

  await prisma.product.update({
    where: { id: productId },
    data: {
      auctionStatus: 'ENDED',
      auctionEndTime: new Date()
    }
  })

  const endPayload: AuctionEndPayload = {
    auctionId: productId,
    finalPrice: winningBid ? Number(winningBid.price) : Number(product.startingPrice),
    winnerId: winningBid?.userId || '',
    winnerName: winningBid?.user?.nickname || winningBid?.user?.phone || '无'
  }

  io?.to(productId).emit('AUCTION_ENDED', createMessage('AUCTION_ENDED', endPayload))
}

export async function extendAuction(productId: string, extendSeconds: number): Promise<void> {
  const room = rooms.get(productId)
  if (!room) return

  room.endTime += extendSeconds * 1000

  const extendedPayload: AuctionExtendedPayload = {
    auctionId: productId,
    newEndTime: new Date(room.endTime).toISOString()
  }

  const io = getIO()
  io?.to(productId).emit('AUCTION_EXTENDED', createMessage('AUCTION_EXTENDED', extendedPayload))
}