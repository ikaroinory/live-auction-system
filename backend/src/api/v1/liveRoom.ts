import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LiveRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         roomNumber:
 *           type: number
 *         streamerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         coverImage:
 *           type: string
 *         status:
 *           type: number
 *         viewerCount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/live-rooms:
 *   get:
 *     tags: [直播间]
 *     summary: 获取直播间列表
 *     description: 获取所有直播间列表
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *         description: 直播间状态 (0:未开始 1:直播中 2:已结束)
 *     responses:
 *       200:
 *         description: 成功获取直播间列表
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { status } = req.query;
    const where = status ? { status: parseInt(status as string) } : {};
    
    let liveRooms = await prisma.liveRoom.findMany({
      where,
      include: {
        streamer: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true
          }
        },
        _count: {
          select: { followers: true, auctions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // 如果用户已登录，添加关注状态
    if ((req as any).user?.id) {
      const userId = (req as any).user.id;
      const userFollowedRooms = await prisma.liveRoomFollow.findMany({
        where: { userId },
        select: { liveRoomId: true }
      });
      
      const followedIds = new Set(userFollowedRooms.map(f => f.liveRoomId));
      
      liveRooms = liveRooms.map(room => ({
        ...room,
        isFollowed: followedIds.has(room.id)
      }));
    }
    
    res.json(liveRooms);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms/{id}:
 *   get:
 *     tags: [直播间]
 *     summary: 获取直播间详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 直播间ID
 *     responses:
 *       200:
 *         description: 成功获取直播间详情
 *       404:
 *         description: 直播间不存在
 */
router.get('/:id', async (req: Request, res: Response, next: Function) => {
  try {
    const { id } = req.params;
    
    const liveRoom = await prisma.liveRoom.findUnique({
      where: { id },
      include: {
        streamer: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true
          }
        },
        _count: {
          select: { followers: true, auctions: true }
        },
        auctions: true
      }
    });
    
    if (!liveRoom) {
      return res.status(404).json({ message: '直播间不存在' });
    }
    
    // 如果用户已登录，添加关注状态
    if ((req as any).user?.id) {
      const userId = (req as any).user.id;
      const isFollowed = await prisma.liveRoomFollow.findFirst({
        where: { userId, liveRoomId: id }
      });
      
      res.json({ ...liveRoom, isFollowed: !!isFollowed });
    } else {
      res.json({ ...liveRoom, isFollowed: false });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms:
 *   post:
 *     tags: [直播间]
 *     summary: 创建直播间
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
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
    
    const { title, description, coverImage } = req.body;
    
    const liveRoom = await prisma.liveRoom.create({
      data: {
        streamerId: req.user.id,
        title,
        description: description || null,
        coverImage: coverImage || null,
        status: 0
      }
    });
    
    res.status(201).json(liveRoom);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms/{id}:
 *   put:
 *     tags: [直播间]
 *     summary: 更新直播间信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 直播间ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               status:
 *                 type: number
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 直播间不存在
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    const { id } = req.params;
    const { title, description, coverImage, status } = req.body;
    
    // 检查直播间是否存在且当前用户是否是主播
    const existingRoom = await prisma.liveRoom.findUnique({
      where: { id }
    });
    
    if (!existingRoom) {
      return res.status(404).json({ message: '直播间不存在' });
    }
    
    if (existingRoom.streamerId !== req.user.id) {
      return res.status(403).json({ message: '无权限' });
    }
    
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (status !== undefined) {
      data.status = status;
      if (status === 1 && existingRoom.status !== 1) {
        data.startedAt = new Date();
      } else if (status === 2 && existingRoom.status !== 2) {
        data.endedAt = new Date();
      }
    }
    
    const liveRoom = await prisma.liveRoom.update({
      where: { id },
      data
    });
    
    res.json(liveRoom);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms/{id}/follow:
 *   post:
 *     tags: [直播间]
 *     summary: 关注直播间
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 直播间ID
 *     responses:
 *       200:
 *         description: 关注成功
 *       401:
 *         description: 未认证
 *       404:
 *         description: 直播间不存在
 */
router.post('/:id/follow', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    const { id } = req.params;
    
    // 检查直播间是否存在
    const liveRoom = await prisma.liveRoom.findUnique({
      where: { id }
    });
    
    if (!liveRoom) {
      return res.status(404).json({ message: '直播间不存在' });
    }
    
    // 创建关注关系
    const follow = await prisma.liveRoomFollow.upsert({
      where: {
      userId_liveRoomId: {
        userId: req.user.id,
        liveRoomId: id
      }
    },
      create: {
        userId: req.user.id,
        liveRoomId: id
      },
      update: {}
    });
    
    res.json({ message: '关注成功', follow });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms/{id}/unfollow:
 *   post:
 *     tags: [直播间]
 *     summary: 取消关注直播间
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 直播间ID
 *     responses:
 *       200:
 *         description: 取消关注成功
 *       401:
 *         description: 未认证
 *       404:
 *         description: 关注关系不存在
 */
router.post('/:id/unfollow', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    const { id } = req.params;
    
    // 删除关注关系
    await prisma.liveRoomFollow.deleteMany({
      where: {
        userId: req.user.id,
        liveRoomId: id
      }
    });
    
    res.json({ message: '取消关注成功' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/live-rooms/my/followed:
 *   get:
 *     tags: [直播间]
 *     summary: 获取我关注的直播间
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取关注列表
 *       401:
 *         description: 未认证
 */
router.get('/my/followed', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    const follows = await prisma.liveRoomFollow.findMany({
      where: { userId: req.user.id },
      include: {
        liveRoom: {
          include: {
            streamer: {
              select: {
                id: true,
                phone: true,
                nickname: true,
                avatar: true
              }
            },
            _count: {
              select: { followers: true, auctions: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(follows);
  } catch (error) {
    next(error);
  }
});

export default router;
