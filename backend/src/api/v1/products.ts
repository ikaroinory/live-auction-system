import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { ProductTag } from '@prisma/client'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import type { ProductResponse, PagedResponse } from '../response'

interface DeleteResponse {
  message: string
}

const router = Router()

interface CreateProductRequest {
  name: string
  description?: string
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
  durationMinutes: number
  extendSeconds?: number
  tags?: string[]
}

interface UpdateProductRequest {
  name?: string
  description?: string
  image?: string
  startingPrice?: number
  fixedIncrement?: number
  maxPrice?: number
  durationMinutes?: number
  extendSeconds?: number
  tags?: string[]
}

router.get(
  '/',
  wrapHandler(
    async (
      req: Request<
        ParamsDictionary,
        PagedResponse<ProductResponse>,
        unknown,
        { status?: string; creatorId?: string; page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<ProductResponse>>
    ) => {
      const { status, creatorId } = req.query
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const where: Partial<{
        status: string
        creatorId: string
      }> = {}
      if (status !== undefined) {
        where.status = status
      }
      if (creatorId !== undefined) {
        where.creatorId = creatorId as string
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
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
        prisma.product.count({ where })
      ])

      const response: PagedResponse<ProductResponse> = {
        list: products.map(
          (product): ProductResponse => ({
            ...product,
            createdAt: product.createdAt.toISOString()
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
    async (req: Request<{ id: string }, ProductResponse>, res: Response<ProductResponse>) => {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      if (!product) {
        return res.status(404).json({ message: '商品不存在' } as unknown as ProductResponse)
      }

      const response: ProductResponse = {
        ...product,
        createdAt: product.createdAt.toISOString()
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
      req: Request<ParamsDictionary, ProductResponse, CreateProductRequest>,
      res: Response<ProductResponse>
    ) => {
      const user = requireAuth(req)
      const {
        name,
        description,
        image,
        startingPrice,
        fixedIncrement,
        maxPrice,
        durationMinutes,
        extendSeconds,
        tags
      } = req.body

      if (!name || !image || !startingPrice || !fixedIncrement || !durationMinutes) {
        return res.status(400).json({ message: '缺少必要参数' } as unknown as ProductResponse)
      }

      const validTags = tags
        ? (tags as string[]).filter((tag) => Object.values(ProductTag).includes(tag as ProductTag))
        : ['AUCTION']

      const product = await prisma.product.create({
        data: {
          name,
          description: description || null,
          image,
          startingPrice,
          fixedIncrement,
          maxPrice: maxPrice || null,
          durationMinutes,
          extendSeconds: extendSeconds || 120,
          tags: validTags.length > 0 ? validTags : ['AUCTION'],
          creatorId: user.id
        },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: ProductResponse = {
        ...product,
        createdAt: product.createdAt.toISOString()
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
      req: Request<{ id: string }, ProductResponse, UpdateProductRequest>,
      res: Response<ProductResponse>
    ) => {
      const user = requireAuth(req)
      const {
        name,
        description,
        image,
        startingPrice,
        fixedIncrement,
        maxPrice,
        durationMinutes,
        extendSeconds,
        tags
      } = req.body

      const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id }
      })

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' } as unknown as ProductResponse)
      }

      if (existingProduct.creatorId !== user.id) {
        return res.status(403).json({ message: '没有权限修改此商品' } as unknown as ProductResponse)
      }

      const updateData: Partial<{
        name: string
        description: string | null
        image: string
        startingPrice: number
        fixedIncrement: number
        maxPrice: number | null
        durationMinutes: number
        extendSeconds: number
        tags: string[]
      }> = {}

      if (name !== undefined) {
        updateData.name = name
      }
      if (description !== undefined) {
        updateData.description = description || null
      }
      if (image !== undefined) {
        updateData.image = image
      }
      if (startingPrice !== undefined) {
        updateData.startingPrice = startingPrice
      }
      if (fixedIncrement !== undefined) {
        updateData.fixedIncrement = fixedIncrement
      }
      if (maxPrice !== undefined) {
        updateData.maxPrice = maxPrice
      }
      if (durationMinutes !== undefined) {
        updateData.durationMinutes = durationMinutes
      }
      if (extendSeconds !== undefined) {
        updateData.extendSeconds = extendSeconds
      }
      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags)
          ? tags.filter((tag: string) => Object.values(ProductTag).includes(tag as ProductTag))
          : ['AUCTION']
      }

      const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
              avatar: true
            }
          }
        }
      })

      const response: ProductResponse = {
        ...updatedProduct,
        createdAt: updatedProduct.createdAt.toISOString()
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

      const existing = await prisma.product.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '商品不存在' })
      }

      if (existing.creatorId !== user.id) {
        return res.status(403).json({ message: '无权限删除此商品' })
      }

      await prisma.product.delete({
        where: { id: req.params.id }
      })

      res.json({ message: '删除成功' })
    }
  )
)

router.get(
  '/creator/:creatorId',
  wrapHandler(
    async (
      req: Request<
        { creatorId: string },
        PagedResponse<ProductResponse>,
        unknown,
        { page?: string; pageSize?: string }
      >,
      res: Response<PagedResponse<ProductResponse>>
    ) => {
      const page = parseInt(req.query.page || '1')
      const pageSize = parseInt(req.query.pageSize || '10')
      const skip = (page - 1) * pageSize

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { creatorId: req.params.creatorId },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
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
        prisma.product.count({ where: { creatorId: req.params.creatorId } })
      ])

      const response: PagedResponse<ProductResponse> = {
        list: products.map(
          (product): ProductResponse => ({
            ...product,
            createdAt: product.createdAt.toISOString()
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
