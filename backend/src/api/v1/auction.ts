import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Auction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         sellerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         startPrice:
 *           type: number
 *         minIncrement:
 *           type: number
 *         maxPrice:
 *           type: number
 *         durationSeconds:
 *           type: number
 *         autoExtendSeconds:
 *           type: number
 *         status:
 *           type: number
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         finalPrice:
 *           type: number
 *         winnerId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/auctions:
 *   get:
 *     tags: [竞拍]
 *     summary: 获取竞拍列表
 *     description: 获取所有竞拍商品列表
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *         description: 竞拍状态 (0:未开始 1:进行中 2:已结束 3:已取消)
 *     responses:
 *       200:
 *         description: 成功获取竞拍列表
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { status } = req.query;
    const where = status ? { status: parseInt(status as string) } : {};

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            phone: true,
            nickname: true,
          },
        },
        winner: {
          select: {
            id: true,
            phone: true,
            nickname: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(auctions);
  } catch (error) {
    next(error);
  }
});

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
    const { id } = req.params;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            phone: true,
            nickname: true,
          },
        },
        winner: {
          select: {
            id: true,
            phone: true,
            nickname: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                nickname: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!auction) {
      return res.status(404).json({ message: '竞拍不存在' });
    }

    res.json(auction);
  } catch (error) {
    next(error);
  }
});

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
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               startPrice:
 *                 type: number
 *               minIncrement:
 *                 type: number
 *               maxPrice:
 *                 type: number
 *               durationSeconds:
 *                 type: number
 *               autoExtendSeconds:
 *                 type: number
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未认证
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }

    const {
      title,
      description,
      images,
      startPrice,
      minIncrement,
      maxPrice,
      durationSeconds,
      autoExtendSeconds,
    } = req.body;

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
        status: 0,
      },
    });

    res.status(201).json(auction);
  } catch (error) {
    next(error);
  }
});

export default router;
