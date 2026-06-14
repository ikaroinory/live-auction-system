import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import type { LiveRoomResponse, PagedResponse } from '../response'

interface DeleteResponse {
  message: string
}

const router = Router()

interface CreateLiveRoomRequest {
  title: string
  description?: string
  coverImage?: string
}

interface UpdateLiveRoomRequest {
  title?: string
  description?: string
  coverImage?: string
}

/**
 * @swagger
 * /api/v1/live-rooms:
 *   get:
 *     summary: 获取直播间列表
 *     tags: [直播间]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 直播间状态过滤（PENDING/LIVE/ENDED）
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
 *                     $ref: '#/components/schemas/LiveRoom'
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
        PagedResponse<LiveRoomResponse>,
        unknown,
        { status?: string; page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<LiveRoomResponse>>
    ) => {
      const { status } = req.query
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const where: Partial<{ status: string }> = {}
      if (status !== undefined) {
        where.status = status
      }

      const [rooms, total] = await Promise.all([
        prisma.liveRoom.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            streamer: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.liveRoom.count({ where })
      ])

      const response: PagedResponse<LiveRoomResponse> = {
        list: rooms.map(
          (room): LiveRoomResponse => ({
            ...room,
            startedAt: room.startedAt ? room.startedAt.toISOString() : null,
            endedAt: room.endedAt ? room.endedAt.toISOString() : null,
            createdAt: room.createdAt.toISOString()
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
 * /api/v1/live-rooms/{id}:
 *   get:
 *     summary: 获取直播间详情
 *     tags: [直播间]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 直播间ID
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveRoom'
 *       404:
 *         description: 直播间不存在
 */
router.get(
  '/:id',
  wrapHandler(
    async (req: Request<{ id: string }, LiveRoomResponse>, res: Response<LiveRoomResponse>) => {
      const room = await prisma.liveRoom.findUnique({
        where: { id: req.params.id },
        include: {
          streamer: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          },
          _count: {
            select: {
              followers: true
            }
          }
        }
      })

      if (!room) {
        return res.status(404).json({ message: '直播间不存在' } as unknown as LiveRoomResponse)
      }

      const response: LiveRoomResponse = {
        ...room,
        startedAt: room.startedAt ? room.startedAt.toISOString() : null,
        endedAt: room.endedAt ? room.endedAt.toISOString() : null,
        createdAt: room.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms:
 *   post:
 *     summary: 创建直播间
 *     tags: [直播间]
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
 *                 description: 直播间标题
 *                 example: "收藏品拍卖专场"
 *               description:
 *                 type: string
 *                 description: 直播间描述
 *                 example: "欢迎来到收藏品拍卖专场"
 *               coverImage:
 *                 type: string
 *                 description: 封面图片URL
 *                 example: "https://example.com/cover.jpg"
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveRoom'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
router.post(
  '/',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<ParamsDictionary, LiveRoomResponse, CreateLiveRoomRequest>,
      res: Response<LiveRoomResponse>
    ) => {
      const user = requireAuth(req)
      const { title, description, coverImage } = req.body

      if (!title) {
        return res.status(400).json({ message: '标题不能为空' } as unknown as LiveRoomResponse)
      }

      const room = await prisma.liveRoom.create({
        data: {
          title,
          description: description || null,
          coverImage: coverImage || null,
          streamerId: user.id
        },
        include: {
          streamer: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: LiveRoomResponse = {
        ...room,
        startedAt: room.startedAt ? room.startedAt.toISOString() : null,
        endedAt: room.endedAt ? room.endedAt.toISOString() : null,
        createdAt: room.createdAt.toISOString()
      }

      res.status(201).json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/{id}:
 *   put:
 *     summary: 更新直播间信息
 *     tags: [直播间]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 直播间标题
 *                 example: "收藏品拍卖专场"
 *               description:
 *                 type: string
 *                 description: 直播间描述
 *                 example: "欢迎来到收藏品拍卖专场"
 *               coverImage:
 *                 type: string
 *                 description: 封面图片URL
 *                 example: "https://example.com/cover.jpg"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveRoom'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 直播间不存在
 */
router.put(
  '/:id',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<{ id: string }, LiveRoomResponse, UpdateLiveRoomRequest>,
      res: Response<LiveRoomResponse>
    ) => {
      const user = requireAuth(req)
      const { title, description, coverImage } = req.body

      const existing = await prisma.liveRoom.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '直播间不存在' } as unknown as LiveRoomResponse)
      }

      if (existing.streamerId !== user.id) {
        return res
          .status(403)
          .json({ message: '无权限修改此直播间' } as unknown as LiveRoomResponse)
      }

      const data: Partial<{
        title: string
        description: string | null
        coverImage: string | null
      }> = {}

      if (title !== undefined) {
        data.title = title
      }
      if (description !== undefined) {
        data.description = description || null
      }
      if (coverImage !== undefined) {
        data.coverImage = coverImage || null
      }

      const room = await prisma.liveRoom.update({
        where: { id: req.params.id },
        data,
        include: {
          streamer: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: LiveRoomResponse = {
        ...room,
        startedAt: room.startedAt ? room.startedAt.toISOString() : null,
        endedAt: room.endedAt ? room.endedAt.toISOString() : null,
        createdAt: room.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/{id}:
 *   delete:
 *     summary: 删除直播间
 *     tags: [直播间]
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
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "删除成功"
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 直播间不存在
 */
router.delete(
  '/:id',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, DeleteResponse>, res: Response<DeleteResponse>) => {
      const user = requireAuth(req)

      const existing = await prisma.liveRoom.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '直播间不存在' })
      }

      if (existing.streamerId !== user.id) {
        return res.status(403).json({ message: '无权限删除此直播间' })
      }

      await prisma.liveRoom.delete({
        where: { id: req.params.id }
      })

      res.json({ message: '删除成功' })
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/{id}/start:
 *   post:
 *     summary: 开始直播
 *     tags: [直播间]
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
 *         description: 开始成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveRoom'
 *       400:
 *         description: 直播已开始
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 直播间不存在
 */
router.post(
  '/:id/start',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, LiveRoomResponse>, res: Response<LiveRoomResponse>) => {
      const user = requireAuth(req)

      const existing = await prisma.liveRoom.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '直播间不存在' } as unknown as LiveRoomResponse)
      }

      if (existing.streamerId !== user.id) {
        return res
          .status(403)
          .json({ message: '无权限操作此直播间' } as unknown as LiveRoomResponse)
      }

      if (existing.status === 'LIVE') {
        return res.status(400).json({ message: '直播已在进行中' } as unknown as LiveRoomResponse)
      }

      const room = await prisma.liveRoom.update({
        where: { id: req.params.id },
        data: {
          status: 'LIVE',
          startedAt: new Date()
        },
        include: {
          streamer: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: LiveRoomResponse = {
        ...room,
        startedAt: room.startedAt ? room.startedAt.toISOString() : null,
        endedAt: room.endedAt ? room.endedAt.toISOString() : null,
        createdAt: room.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/{id}/end:
 *   post:
 *     summary: 结束直播
 *     tags: [直播间]
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
 *         description: 结束成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveRoom'
 *       400:
 *         description: 直播未开始
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 直播间不存在
 */
router.post(
  '/:id/end',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, LiveRoomResponse>, res: Response<LiveRoomResponse>) => {
      const user = requireAuth(req)

      const existing = await prisma.liveRoom.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '直播间不存在' } as unknown as LiveRoomResponse)
      }

      if (existing.streamerId !== user.id) {
        return res
          .status(403)
          .json({ message: '无权限操作此直播间' } as unknown as LiveRoomResponse)
      }

      if (existing.status !== 'LIVE') {
        return res.status(400).json({ message: '直播未在进行中' } as unknown as LiveRoomResponse)
      }

      const room = await prisma.liveRoom.update({
        where: { id: req.params.id },
        data: {
          status: 'ENDED',
          endedAt: new Date()
        },
        include: {
          streamer: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: LiveRoomResponse = {
        ...room,
        startedAt: room.startedAt ? room.startedAt.toISOString() : null,
        endedAt: room.endedAt ? room.endedAt.toISOString() : null,
        createdAt: room.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/host/{hostId}:
 *   get:
 *     summary: 获取主播的直播间列表
 *     tags: [直播间]
 *     parameters:
 *       - in: path
 *         name: hostId
 *         required: true
 *         schema:
 *           type: string
 *         description: 主播用户ID
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
 *                     $ref: '#/components/schemas/LiveRoom'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
router.get(
  '/host/:hostId',
  wrapHandler(
    async (
      req: Request<
        { hostId: string },
        PagedResponse<LiveRoomResponse>,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<LiveRoomResponse>>
    ) => {
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const [rooms, total] = await Promise.all([
        prisma.liveRoom.findMany({
          where: { streamerId: req.params.hostId },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            streamer: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.liveRoom.count({ where: { streamerId: req.params.hostId } })
      ])

      const response: PagedResponse<LiveRoomResponse> = {
        list: rooms.map(
          (room): LiveRoomResponse => ({
            ...room,
            startedAt: room.startedAt ? room.startedAt.toISOString() : null,
            endedAt: room.endedAt ? room.endedAt.toISOString() : null,
            createdAt: room.createdAt.toISOString()
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
 * /api/v1/live-rooms/{id}/follow:
 *   post:
 *     summary: 关注直播间
 *     tags: [直播间]
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
router.post(
  '/:id/follow',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, { message: string }>, res: Response<{ message: string }>) => {
      const user = requireAuth(req)

      const existing = await prisma.liveRoom.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '直播间不存在' })
      }

      await prisma.liveRoomFollow.create({
        data: {
          userId: user.id,
          liveRoomId: req.params.id
        }
      })

      res.json({ message: '关注成功' })
    }
  )
)

/**
 * @swagger
 * /api/v1/live-rooms/{id}/unfollow:
 *   post:
 *     summary: 取消关注直播间
 *     tags: [直播间]
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
 */
router.post(
  '/:id/unfollow',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, { message: string }>, res: Response<{ message: string }>) => {
      const user = requireAuth(req)

      await prisma.liveRoomFollow.deleteMany({
        where: {
          userId: user.id,
          liveRoomId: req.params.id
        }
      })

      res.json({ message: '取消关注成功' })
    }
  )
)

export default router
