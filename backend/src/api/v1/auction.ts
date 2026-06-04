import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import type { AuctionResponse, BidResponse, PagedResponse } from '../response'

const router = Router()

interface CreateAuctionRequest {
  productId: string
  reservePrice: number
  startTime: string
  endTime: string
  fixedIncrement: number
}

interface BidRequest {
  amount: number
}

/**
 * @swagger
 * /api/v1/auctions:
 *   get:
 *     summary: 获取拍卖列表
 *     tags: [拍卖]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 拍卖状态过滤（PENDING/LIVE/ENDED）
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
 *                     $ref: '#/components/schemas/Auction'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
router.get(
  '/',
  wrapHandler(
    async (
      req: Request<
        ParamsDictionary,
        PagedResponse<AuctionResponse>,
        unknown,
        { status?: string; page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<AuctionResponse>>
    ) => {
      const { status } = req.query
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const where: Partial<{ status: string }> = {}
      if (status !== undefined) {
        where.status = status
      }

      const [auctions, total] = await Promise.all([
        prisma.auction.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                startingPrice: true
              }
            },
            currentWinner: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.auction.count({ where })
      ])

      const response: PagedResponse<AuctionResponse> = {
        list: auctions.map(
          (auction): AuctionResponse => ({
            ...auction,
            startTime: auction.startTime.toISOString(),
            endTime: auction.endTime.toISOString(),
            createdAt: auction.createdAt.toISOString()
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

/**
 * @swagger
 * /api/v1/auctions/{id}:
 *   get:
 *     summary: 获取拍卖详情
 *     tags: [拍卖]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 拍卖ID
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auction'
 *       404:
 *         description: 拍卖不存在
 */
router.get(
  '/:id',
  wrapHandler(
    async (req: Request<{ id: string }, AuctionResponse>, res: Response<AuctionResponse>) => {
      const auction = await prisma.auction.findUnique({
        where: { id: req.params.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              startingPrice: true,
              description: true,
              tags: true
            }
          },
          currentWinner: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      if (!auction) {
        return res.status(404).json({ message: '拍卖不存在' } as unknown as AuctionResponse)
      }

      const response: AuctionResponse = {
        ...auction,
        startTime: auction.startTime.toISOString(),
        endTime: auction.endTime.toISOString(),
        createdAt: auction.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/auctions:
 *   post:
 *     summary: 创建拍卖
 *     tags: [拍卖]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - reservePrice
 *               - startTime
 *               - endTime
 *               - fixedIncrement
 *             properties:
 *               productId:
 *                 type: string
 *                 description: 商品ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               reservePrice:
 *                 type: number
 *                 description: 保留价
 *                 example: 100
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *                 example: "2024-12-01T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *                 example: "2024-12-01T12:00:00Z"
 *               fixedIncrement:
 *                 type: number
 *                 description: 固定加价
 *                 example: 10
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auction'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权创建拍卖
 *       404:
 *         description: 商品不存在
 */
router.post(
  '/',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<ParamsDictionary, AuctionResponse, CreateAuctionRequest>,
      res: Response<AuctionResponse>
    ) => {
      const user = requireAuth(req)
      const { productId, reservePrice, startTime, endTime, fixedIncrement } = req.body

      if (!productId || !reservePrice || !startTime || !endTime || !fixedIncrement) {
        return res.status(400).json({ message: '缺少必要参数' } as unknown as AuctionResponse)
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return res.status(404).json({ message: '商品不存在' } as unknown as AuctionResponse)
      }

      if (product.creatorId !== user.id) {
        return res.status(403).json({ message: '无权创建拍卖' } as unknown as AuctionResponse)
      }

      const startTimeDate = new Date(startTime)
      const endTimeDate = new Date(endTime)

      if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
        return res.status(400).json({ message: '时间格式错误' } as unknown as AuctionResponse)
      }

      if (startTimeDate <= new Date()) {
        return res
          .status(400)
          .json({ message: '开始时间必须晚于当前时间' } as unknown as AuctionResponse)
      }

      if (endTimeDate <= startTimeDate) {
        return res
          .status(400)
          .json({ message: '结束时间必须晚于开始时间' } as unknown as AuctionResponse)
      }

      const auction = await prisma.auction.create({
        data: {
          productId,
          reservePrice,
          startTime: startTimeDate,
          endTime: endTimeDate,
          fixedIncrement,
          currentPrice: reservePrice
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              startingPrice: true
            }
          }
        }
      })

      const response: AuctionResponse = {
        ...auction,
        startTime: auction.startTime.toISOString(),
        endTime: auction.endTime.toISOString(),
        createdAt: auction.createdAt.toISOString()
      }

      res.status(201).json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/auctions/{id}/bid:
 *   post:
 *     summary: 参与拍卖出价
 *     tags: [拍卖]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 拍卖ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: 出价金额
 *                 example: 150
 *     responses:
 *       200:
 *         description: 出价成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auction'
 *       400:
 *         description: 参数错误或拍卖不可出价
 *       401:
 *         description: 未认证
 *       404:
 *         description: 拍卖不存在
 */
router.post(
  '/:id/bid',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<{ id: string }, AuctionResponse, BidRequest>,
      res: Response<AuctionResponse>
    ) => {
      const user = requireAuth(req)
      const { amount } = req.body

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: '出价金额必须大于0' } as unknown as AuctionResponse)
      }

      const auction = await prisma.auction.findUnique({
        where: { id: req.params.id },
        include: { product: true }
      })

      if (!auction) {
        return res.status(404).json({ message: '拍卖不存在' } as unknown as AuctionResponse)
      }

      if (auction.status === 'ENDED') {
        return res.status(400).json({ message: '拍卖已结束' } as unknown as AuctionResponse)
      }

      if (auction.status === 'PENDING') {
        return res.status(400).json({ message: '拍卖尚未开始' } as unknown as AuctionResponse)
      }

      if (auction.endTime <= new Date()) {
        return res.status(400).json({ message: '拍卖已结束' } as unknown as AuctionResponse)
      }

      if (amount < auction.reservePrice) {
        return res.status(400).json({ message: '出价不能低于保留价' } as unknown as AuctionResponse)
      }

      if (amount <= auction.currentPrice) {
        return res
          .status(400)
          .json({ message: '出价必须高于当前价格' } as unknown as AuctionResponse)
      }

      if ((amount - auction.currentPrice) % auction.fixedIncrement !== 0) {
        return res
          .status(400)
          .json({ message: '出价必须是固定加价的倍数' } as unknown as AuctionResponse)
      }

      const updatedAuction = await prisma.auction.update({
        where: { id: req.params.id },
        data: {
          currentPrice: amount,
          currentWinnerId: user.id
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          currentWinner: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      await prisma.bid.create({
        data: {
          auctionId: req.params.id,
          userId: user.id,
          amount
        }
      })

      const response: AuctionResponse = {
        ...updatedAuction,
        startTime: updatedAuction.startTime.toISOString(),
        endTime: updatedAuction.endTime.toISOString(),
        createdAt: updatedAuction.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/auctions/{id}/bids:
 *   get:
 *     summary: 获取拍卖出价记录
 *     tags: [拍卖]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 拍卖ID
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
 *           default: 20
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
 *                     $ref: '#/components/schemas/Bid'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
router.get(
  '/:id/bids',
  wrapHandler(
    async (
      req: Request<
        { id: string },
        PagedResponse<BidResponse>,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<BidResponse>>
    ) => {
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '20')
      const skip = (page - 1) * pageSize

      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
          where: { auctionId: req.params.id },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.bid.count({ where: { auctionId: req.params.id } })
      ])

      const response: PagedResponse<BidResponse> = {
        list: bids.map(
          (bid): BidResponse => ({
            ...bid,
            createdAt: bid.createdAt.toISOString()
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

/**
 * @swagger
 * /api/v1/auctions/user/{userId}:
 *   get:
 *     summary: 获取用户的拍卖列表
 *     tags: [拍卖]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
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
 *                     $ref: '#/components/schemas/Auction'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
router.get(
  '/user/:userId',
  wrapHandler(
    async (
      req: Request<
        { userId: string },
        PagedResponse<AuctionResponse>,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<AuctionResponse>>
    ) => {
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const [auctions, total] = await Promise.all([
        prisma.auction.findMany({
          where: {
            product: {
              creatorId: req.params.userId
            }
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }),
        prisma.auction.count({
          where: {
            product: {
              creatorId: req.params.userId
            }
          }
        })
      ])

      const response: PagedResponse<AuctionResponse> = {
        list: auctions.map(
          (auction): AuctionResponse => ({
            ...auction,
            startTime: auction.startTime.toISOString(),
            endTime: auction.endTime.toISOString(),
            createdAt: auction.createdAt.toISOString()
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
