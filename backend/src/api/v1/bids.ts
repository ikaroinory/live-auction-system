import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import {
  BidResponse,
  PagedBidResponse,
  CreateBidRequest,
  BidParams
} from '@live-auction/shared'

const router = Router()

/**
 * @swagger
 * /api/v1/bids/my:
 *   get:
 *     summary: 获取当前用户的出价记录
 *     tags: [出价]
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
 *                     $ref: '#/components/schemas/Bid'
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
        PagedBidResponse,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedBidResponse>
    ) => {
      const user = requireAuth(req)
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
          where: { userId: user.id },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                phone: true,
                avatar: true
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                auctionStatus: true,
                currentBidPrice: true,
                auctionEndTime: true
              }
            }
          }
        }),
        prisma.bid.count({ where: { userId: user.id } })
      ])

      const response: PagedBidResponse = {
        list: bids.map((bid): BidResponse => ({
          ...bid,
          price: Number(bid.price),
          createdAt: bid.createdAt.toISOString()
        })),
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
 * /api/v1/bids:
 *   get:
 *     summary: 获取出价记录列表
 *     tags: [出价]
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
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: 商品ID过滤
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID过滤
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
 *       401:
 *         description: 未认证
 */
router.get(
  '/',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<
        ParamsDictionary,
        PagedBidResponse,
        unknown,
        BidParams
      >,
      res: Response<PagedBidResponse>
    ) => {
      const { page = 1, pageSize = 10, productId, userId } = req.query
      const skip = (page - 1) * pageSize

      const where: Record<string, unknown> = {}
      if (productId) {
        where.productId = productId
      }
      if (userId) {
        where.userId = userId
      }

      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                phone: true,
                avatar: true
              }
            }
          }
        }),
        prisma.bid.count({ where })
      ])

      const response: PagedBidResponse = {
        list: bids.map((bid): BidResponse => ({
          ...bid,
          price: Number(bid.price),
          createdAt: bid.createdAt.toISOString()
        })),
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
 * /api/v1/bids/{id}:
 *   get:
 *     summary: 获取出价记录详情
 *     tags: [出价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 出价记录ID
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bid'
 *       401:
 *         description: 未认证
 *       404:
 *         description: 出价记录不存在
 */
router.get(
  '/:id',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, BidResponse>, res: Response<BidResponse>) => {
      const bid = await prisma.bid.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              avatar: true
            }
          }
        }
      })

      if (!bid) {
        return res.status(404).json({ message: '出价记录不存在' } as unknown as BidResponse)
      }

      const response: BidResponse = {
        ...bid,
        price: Number(bid.price),
        createdAt: bid.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/bids:
 *   post:
 *     summary: 创建出价记录
 *     tags: [出价]
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
 *               - price
 *             properties:
 *               productId:
 *                 type: string
 *                 description: 商品ID
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               price:
 *                 type: number
 *                 description: 出价金额
 *                 example: 100
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bid'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 *       404:
 *         description: 商品不存在
 */
router.post(
  '/',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<ParamsDictionary, BidResponse, CreateBidRequest>,
      res: Response<BidResponse>
    ) => {
      const user = requireAuth(req)
      const { productId, price } = req.body

      if (!productId || !price) {
        return res.status(400).json({ message: '缺少必要参数' } as unknown as BidResponse)
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return res.status(404).json({ message: '商品不存在' } as unknown as BidResponse)
      }

      if (product.auctionStatus !== 'IN_PROGRESS') {
        return res.status(400).json({ message: '商品竞拍未在进行中' } as unknown as BidResponse)
      }

      const currentPrice = Number(product.currentBidPrice || product.startingPrice)
      if (price <= currentPrice) {
        return res.status(400).json({ message: '出价必须高于当前价格' } as unknown as BidResponse)
      }

      const bid = await prisma.bid.create({
        data: {
          productId,
          userId: user.id,
          price
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              avatar: true
            }
          }
        }
      })

      await prisma.product.update({
        where: { id: productId },
        data: {
          currentBidPrice: price,
          bidCount: { increment: 1 }
        }
      })

      const response: BidResponse = {
        ...bid,
        price: Number(bid.price),
        createdAt: bid.createdAt.toISOString()
      }

      res.status(201).json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/products/{productId}/bids:
 *   get:
 *     summary: 获取商品出价记录
 *     tags: [出价]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
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
 *                     $ref: '#/components/schemas/Bid'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 *       404:
 *         description: 商品不存在
 */
router.get(
  '/product/:productId',
  wrapHandler(
    async (
      req: Request<
        { productId: string },
        PagedBidResponse,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedBidResponse>
    ) => {
      const { productId } = req.params
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return res.status(404).json({ message: '商品不存在' } as unknown as PagedBidResponse)
      }

      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
          where: { productId },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                phone: true,
                avatar: true
              }
            }
          }
        }),
        prisma.bid.count({ where: { productId } })
      ])

      const response: PagedBidResponse = {
        list: bids.map((bid): BidResponse => ({
          ...bid,
          price: Number(bid.price),
          createdAt: bid.createdAt.toISOString()
        })),
        total,
        page,
        pageSize
      }

      res.json(response)
    }
  )
)

export default router