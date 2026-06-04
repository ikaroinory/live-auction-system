import { Request, Response, Router } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { PrismaClient, Prisma } from '@prisma/client'

export type Handler<E = unknown> = (
  req: Request,
  res: Response,
  next: (err?: E) => void
) => Promise<void> | void

export type AuthHandler<E = unknown> = (
  req: Request & { user?: { id: string; phone: string } },
  res: Response,
  next: (err?: E) => void
) => Promise<void> | void

export function wrapHandler<E = unknown>(handler: Handler<E>): Handler<E> {
  return async (req: Request, res: Response, next: (err?: E) => void) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error as E)
    }
  }
}

export function wrapAuthHandler<E = unknown>(handler: AuthHandler<E>): AuthHandler<E> {
  return async (
    req: Request & { user?: { id: string; phone: string } },
    res: Response,
    next: (err?: E) => void
  ) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error as E)
    }
  }
}

export interface CRUDConfig<T, CreateData, UpdateData> {
  model: PrismaClient[keyof PrismaClient]
  createValidator?: (data: CreateData) => string | null
  updateValidator?: (data: UpdateData) => string | null
  serialize?: (item: T) => T
  authorize?: (userId: string, item: T) => boolean
}

export type ModelFindMany<T> = (args: {
  where?: Prisma.WhereInput
  skip?: number
  take?: number
  orderBy?: Prisma.SortOrder | Prisma.OrderByInput
  include?: Prisma.Include | undefined
}) => Promise<T[]>

export type ModelCount = (args: { where?: Prisma.WhereInput }) => Promise<number>

export type ModelFindUnique<T> = (args: {
  where: Prisma.WhereUniqueInput
  include?: Prisma.Include | undefined
}) => Promise<T | null>

export type ModelCreate<T, CreateData> = (args: {
  data: CreateData
  include?: Prisma.Include | undefined
}) => Promise<T>

export type ModelUpdate<T, UpdateData> = (args: {
  where: Prisma.WhereUniqueInput
  data: UpdateData
  include?: Prisma.Include | undefined
}) => Promise<T>

export type ModelDelete = (args: { where: Prisma.WhereUniqueInput }) => Promise<void>

export function createCRUDRouter<T, CreateData = T, UpdateData = Partial<T>>(
  config: CRUDConfig<T, CreateData, UpdateData>
) {
  const router = Router()
  const model = config.model as {
    findMany: ModelFindMany<T>
    count: ModelCount
    findUnique: ModelFindUnique<T>
    create: ModelCreate<T, CreateData>
    update: ModelUpdate<T, UpdateData>
    delete: ModelDelete
  }

  router.get(
    '/',
    wrapHandler(
      async (
        req: Request<ParamsDictionary, unknown, unknown, { page?: string; pageSize?: string }>,
        res
      ) => {
        const page = parseInt(req.query.page || '1')
        const pageSize = parseInt(req.query.pageSize || '10')
        const skip = (page - 1) * pageSize

        const [items, total] = await Promise.all([
          model.findMany({
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
          }),
          model.count({})
        ])

        res.json({
          list: items.map(config.serialize || ((x) => x)),
          total,
          page,
          pageSize
        })
      }
    )
  )

  router.get(
    '/:id',
    wrapHandler(async (req: Request<{ id: string }>, res) => {
      const item = await model.findUnique({
        where: { id: req.params.id }
      })

      if (!item) {
        return res.status(404).json({ message: '资源不存在' })
      }

      res.json(config.serialize ? config.serialize(item) : item)
    })
  )

  router.post(
    '/',
    wrapAuthHandler(async (req: Request<ParamsDictionary, unknown, CreateData>, res) => {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      if (config.createValidator) {
        const error = config.createValidator(req.body)
        if (error) {
          return res.status(400).json({ message: error })
        }
      }

      const item = await model.create({
        data: req.body
      })

      res.status(201).json(config.serialize ? config.serialize(item) : item)
    })
  )

  router.put(
    '/:id',
    wrapAuthHandler(async (req: Request<{ id: string }, unknown, UpdateData>, res) => {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const existing = await model.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '资源不存在' })
      }

      if (config.authorize && !config.authorize(req.user.id, existing)) {
        return res.status(403).json({ message: '无权限' })
      }

      if (config.updateValidator) {
        const error = config.updateValidator(req.body)
        if (error) {
          return res.status(400).json({ message: error })
        }
      }

      const item = await model.update({
        where: { id: req.params.id },
        data: req.body
      })

      res.json(config.serialize ? config.serialize(item) : item)
    })
  )

  router.delete(
    '/:id',
    wrapAuthHandler(async (req: Request<{ id: string }>, res) => {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const existing = await model.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '资源不存在' })
      }

      if (config.authorize && !config.authorize(req.user.id, existing)) {
        return res.status(403).json({ message: '无权限' })
      }

      await model.delete({
        where: { id: req.params.id }
      })

      res.json({ message: '删除成功' })
    })
  )

  return router
}

export function requireAuth(req: Request & { user?: { id: string; phone: string } }) {
  if (!req.user) {
    throw new Error('未认证')
  }
  return req.user
}

export function requireResource<T>(
  resource: T | null | undefined,
  message: string = '资源不存在'
): T {
  if (!resource) {
    throw new Error(message)
  }
  return resource
}

export function requirePermission(hasPermission: boolean, message: string = '无权限') {
  if (!hasPermission) {
    throw new Error(message)
  }
}
