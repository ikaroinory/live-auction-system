import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { wrapAuthHandler, requireAuth } from '../utils'
import { PagedProductResponse, ProductResponse, ProductAuctionStatus, ProductStatus } from '@live-auction/shared'

const router = Router()

/**
 * @swagger
 * /api/v1/orders/my:
 *   get:
 *     summary: 获取当前用户的订单（赢得的商品）
 *     tags: [订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 *       401:
 *         description: 未认证
 */
router.get(
  '/my',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<
        ParamsDictionary,
        PagedProductResponse,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedProductResponse>
    ) => {
      const user = requireAuth(req)
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      // 获取用户赢得的商品（竞拍结束且用户是最高出价者）
      const wonProducts = await prisma.$queryRaw<Array<{ productId: string }>>`
        SELECT DISTINCT b.productId
        FROM Bid b
        INNER JOIN Product p ON b.productId = p.id
        WHERE b.userId = ${user.id}
          AND p.auctionStatus = 'ENDED'
          AND b.price = (
            SELECT MAX(b2.price)
            FROM Bid b2
            WHERE b2.productId = b.productId
          )
      `

      const productIds = wonProducts.map(p => p.productId)

      if (productIds.length === 0) {
        const response: PagedProductResponse = {
          list: [],
          total: 0,
          page,
          pageSize
        }
        return res.json(response)
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { id: { in: productIds } },
          skip,
          take: pageSize,
          orderBy: { auctionEndTime: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.product.count({ where: { id: { in: productIds } } })
      ])

      const response: PagedProductResponse = {
        list: products.map(
          (product): ProductResponse => ({
            ...product,
            description: null,
            tags: (Array.isArray(product.tags) ? product.tags : []) as string[],
            auctionStatus: product.auctionStatus as ProductAuctionStatus,
            status: product.status as ProductStatus,
            startingPrice: Number(product.startingPrice),
            fixedIncrement: Number(product.fixedIncrement),
            maxPrice: product.maxPrice ? Number(product.maxPrice) : null,
            currentBidPrice: product.currentBidPrice ? Number(product.currentBidPrice) : null,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
            auctionStartTime: product.auctionStartTime?.toISOString() || null,
            auctionEndTime: product.auctionEndTime?.toISOString() || null
          })
        ),
        total,
        page,
        pageSize
      }

      res.json(response)
    }
  )
)

export default router