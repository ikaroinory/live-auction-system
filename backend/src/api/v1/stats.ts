import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { wrapAuthHandler, requireAuth } from '../utils'

const router = Router()

interface StatsResponse {
  ongoingAuctions: number
  todayOrders: number
  totalProducts: number
  gmv: number
}

router.get(
  '/',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request, res: Response<StatsResponse>) => {
      const user = requireAuth(req)

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

      const [ongoingAuctions, todayOrders, totalProducts, gmv] = await Promise.all([
        prisma.product.count({
          where: {
            creatorId: user.id,
            auctionStatus: 'IN_PROGRESS'
          }
        }),
        prisma.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(DISTINCT b.productId) as count
          FROM Bid b
          INNER JOIN Product p ON b.productId = p.id
          WHERE p.creatorId = ${user.id}
            AND p.auctionStatus = 'ENDED'
            AND b.price = (
              SELECT MAX(b2.price)
              FROM Bid b2
              WHERE b2.productId = b.productId
            )
            AND b.createdAt >= ${todayStart}
            AND b.createdAt < ${todayEnd}
        `,
        prisma.product.count({
          where: {
            creatorId: user.id
          }
        }),
        prisma.$queryRaw<Array<{ total: number }>>`
          SELECT COALESCE(SUM(b.price), 0) as total
          FROM Bid b
          INNER JOIN Product p ON b.productId = p.id
          WHERE p.creatorId = ${user.id}
            AND p.auctionStatus = 'ENDED'
            AND b.price = (
              SELECT MAX(b2.price)
              FROM Bid b2
              WHERE b2.productId = b.productId
            )
        `
      ])

      const response: StatsResponse = {
        ongoingAuctions,
        todayOrders: Number(todayOrders[0]?.count) || 0,
        totalProducts,
        gmv: Number(gmv[0]?.total) || 0
      }

      res.json(response)
    }
  )
)

export default router