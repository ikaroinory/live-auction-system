import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/auth'
import {
  scheduleAuctionExpire,
  cancelAuctionExpire,
  settleProductAuction
} from '../../services/auctionExpire.service'

const router = Router()

/**
 * @swagger
 * /api/v1/auctions:
 *   get:
 *     tags: [竞拍]
 *     summary: 获取竞拍列表
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *         description: 竞拍状态 (0:待开始 1:进行中 2:已结束)
 *     responses:
 *       200:
 *         description: 成功获取竞拍列表
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { status } = req.query
    const where = status ? { status: parseInt(status as string) } : {}

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        },
        winner: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(auctions)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/auctions/{id}:
 *   get:
 *     tags: [竞拍]
 *     summary: 获取竞拍详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 竞拍ID
 *     responses:
 *       200:
 *         description: 成功获取竞拍详情
 *       404:
 *         description: 竞拍不存在
 */
router.get('/:id', async (req: Request, res: Response, next: Function) => {
  try {
    const { id } = req.params

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        },
        winner: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                nickname: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!auction) {
      return res.status(404).json({ message: '竞拍不存在' })
    }

    res.json(auction)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/auctions:
 *   post:
 *     tags: [竞拍]
 *     summary: 创建竞拍
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startPrice
 *               - minIncrement
 *               - durationSeconds
 *             properties:
 *               title:
 *                 type: string
 *                 description: 竞拍标题
 *               description:
 *                 type: string
 *                 description: 竞拍描述
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 图片URL列表
 *               startPrice:
 *                 type: number
 *                 description: 起拍价
 *               minIncrement:
 *                 type: number
 *                 description: 最小加价幅度
 *               maxPrice:
 *                 type: number
 *                 description: 最高限价
 *               durationSeconds:
 *                 type: number
 *                 description: 竞拍时长（秒）
 *               autoExtendSeconds:
 *                 type: number
 *                 description: 自动延长时间（秒）
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未认证
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const {
      title,
      description,
      images,
      startPrice,
      minIncrement,
      maxPrice,
      durationSeconds,
      autoExtendSeconds
    } = req.body

    const auction = await prisma.auction.create({
      data: {
        sellerId: req.user.id,
        title,
        description,
        images: images || [],
        startPrice,
        minIncrement,
        maxPrice: maxPrice || null,
        durationSeconds,
        autoExtendSeconds: autoExtendSeconds || 15,
        status: 0
      }
    })

    res.status(201).json(auction)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/auctions/{id}/start:
 *   post:
 *     tags: [竞拍]
 *     summary: 开始竞拍
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 竞拍ID
 *     responses:
 *       200:
 *         description: 竞拍已开始
 *       400:
 *         description: 竞拍状态不允许
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 *       404:
 *         description: 竞拍不存在
 */
router.post(
  '/:id/start',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: Function) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const { id } = req.params

      const auction = await prisma.auction.findUnique({
        where: { id }
      })

      if (!auction) {
        return res.status(404).json({ message: '竞拍不存在' })
      }

      if (auction.sellerId !== req.user.id) {
        return res.status(403).json({ message: '无权操作' })
      }

      if (auction.status !== 0) {
        return res.status(400).json({ message: '竞拍状态不允许' })
      }

      const now = new Date()
      const endTime = new Date(now.getTime() + auction.durationSeconds * 1000)

      const updatedAuction = await prisma.auction.update({
        where: { id },
        data: {
          status: 1,
          startTime: now
        }
      })

      if (auction.productId) {
        await scheduleAuctionExpire(auction.productId, id, endTime)
      }

      res.json({
        message: '竞拍已开始',
        auction: updatedAuction
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/v1/auctions/{id}/bid:
 *   post:
 *     tags: [竞拍]
 *     summary: 竞拍出价
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 竞拍ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 description: 出价金额
 *     responses:
 *       200:
 *         description: 出价成功
 *       400:
 *         description: 出价低于最低加价或超过最高限价
 *       401:
 *         description: 未认证
 *       404:
 *         description: 竞拍不存在
 */
router.post('/:id/bid', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const { id } = req.params
    const { price } = req.body

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { price: 'desc' },
          take: 1
        }
      }
    })

    if (!auction) {
      return res.status(404).json({ message: '竞拍不存在' })
    }

    if (auction.status !== 1) {
      return res.status(400).json({ message: '竞拍未进行中' })
    }

    if (auction.sellerId === req.user.id) {
      return res.status(400).json({ message: '卖家不能参与自己的竞拍' })
    }

    const currentPrice =
      auction.bids.length > 0
        ? parseFloat(auction.bids[0].price.toString())
        : parseFloat(auction.startPrice.toString())

    const minNextPrice = currentPrice + parseFloat(auction.minIncrement.toString())

    if (price < minNextPrice) {
      return res.status(400).json({
        message: `出价低于最低加价，当前最低出价: ${minNextPrice}`
      })
    }

    if (auction.maxPrice && price > parseFloat(auction.maxPrice.toString())) {
      return res.status(400).json({
        message: `出价超过最高限价，最高限价: ${auction.maxPrice}`
      })
    }

    const bid = await prisma.bid.create({
      data: {
        auctionId: id,
        userId: req.user.id,
        price
      }
    })

    if (auction.productId && auction.startTime) {
      const newEndTime = new Date(
        auction.startTime.getTime() +
          auction.durationSeconds * 1000 +
          auction.autoExtendSeconds * 1000
      )
      await scheduleAuctionExpire(auction.productId, id, newEndTime)
    }

    res.json({
      message: '出价成功',
      bid
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/auctions/{id}/end:
 *   post:
 *     tags: [竞拍]
 *     summary: 结束竞拍
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 竞拍ID
 *     responses:
 *       200:
 *         description: 竞拍已结束
 *       400:
 *         description: 竞拍已结束
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 *       404:
 *         description: 竞拍不存在
 */
router.post('/:id/end', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const { id } = req.params

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { price: 'desc' },
          take: 1
        }
      }
    })

    if (!auction) {
      return res.status(404).json({ message: '竞拍不存在' })
    }

    if (auction.sellerId !== req.user.id) {
      return res.status(403).json({ message: '无权操作' })
    }

    if (auction.status === 2) {
      return res.status(400).json({ message: '竞拍已结束' })
    }

    if (auction.productId) {
      await cancelAuctionExpire(auction.productId)
      await settleProductAuction(auction.productId)
    } else {
      let finalPrice = auction.startPrice
      let winnerId: string | null = null

      if (auction.bids.length > 0) {
        finalPrice = auction.bids[0].price
        winnerId = auction.bids[0].userId
      }

      const now = new Date()

      const updatedAuction = await prisma.auction.update({
        where: { id },
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
            auctionId: id,
            userId: winnerId,
            sellerId: auction.sellerId,
            finalPrice,
            status: 0
          }
        })
      }
    }

    const updatedAuction = await prisma.auction.findUnique({
      where: { id }
    })

    res.json({
      message: '竞拍已结束',
      auction: updatedAuction
    })
  } catch (error) {
    next(error)
  }
})

export default router
