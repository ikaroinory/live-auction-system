import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/auth'
import { setAuctionExpire, extendAuctionExpire } from '../../services/auctionExpire.service'

const router = Router()

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
 *         description: 开始成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 *       404:
 *         description: 竞拍不存在
 *       400:
 *         description: 竞拍状态不允许
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

      const updatedAuction = await prisma.auction.update({
        where: { id },
        data: {
          status: 1,
          startTime: now
        }
      })

      await setAuctionExpire(id, auction.durationSeconds)

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
 *     summary: 出价
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
 *       401:
 *         description: 未认证
 *       404:
 *         description: 竞拍不存在
 *       400:
 *         description: 出价无效
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

    await extendAuctionExpire(id, auction.autoExtendSeconds)

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
 *     summary: 手动结束竞拍
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
 *         description: 结束成功
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

    res.json({
      message: '竞拍已结束',
      auction: updatedAuction
    })
  } catch (error) {
    next(error)
  }
})

export default router
