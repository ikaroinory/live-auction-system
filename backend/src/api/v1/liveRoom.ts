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
            host: {
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

router.get(
  '/:id',
  wrapHandler(
    async (req: Request<{ id: string }, LiveRoomResponse>, res: Response<LiveRoomResponse>) => {
      const room = await prisma.liveRoom.findUnique({
        where: { id: req.params.id },
        include: {
          host: {
            select: {
              id: true,
              nickname: true,
              avatar: true
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
          hostId: user.id
        },
        include: {
          host: {
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

      if (existing.hostId !== user.id) {
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
          host: {
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

      if (existing.hostId !== user.id) {
        return res.status(403).json({ message: '无权限删除此直播间' })
      }

      await prisma.liveRoom.delete({
        where: { id: req.params.id }
      })

      res.json({ message: '删除成功' })
    }
  )
)

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

      if (existing.hostId !== user.id) {
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
          host: {
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

      if (existing.hostId !== user.id) {
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
          host: {
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
          where: { hostId: req.params.hostId },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            host: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }),
        prisma.liveRoom.count({ where: { hostId: req.params.hostId } })
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

export default router
