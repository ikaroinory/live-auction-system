import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/auth'
import { ProductTag } from '@prisma/client'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import type { ProductResponse, PagedResponse } from '../response'
import {
  setRoomExplainingProduct,
  getRoomExplainingProduct,
  clearRoomExplainingProduct
} from '../../lib/redis'

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

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [商品]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 商品状态过滤
 *       - in: query
 *         name: creatorId
 *         schema:
 *           type: string
 *         description: 创建者ID
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
 *                     $ref: '#/components/schemas/Product'
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

      const where: Record<string, unknown> = {}
      if (status !== undefined && ['PENDING', 'PUBLISHED'].includes(status)) {
        where.status = status as 'PENDING' | 'PUBLISHED'
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

/**
 * @swagger
 * /api/v1/products/explaining:
 *   get:
 *     summary: 获取当前正在讲解的商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productId:
 *                   type: string
 *                   nullable: true
 *                 roomId:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: 用户未创建直播间
 *       401:
 *         description: 未认证
 */
router.get(
  '/explaining',
  authMiddleware,
  wrapAuthHandler(
    async (_req: Request, res: Response) => {
      const user = requireAuth(_req)

      const liveRoom = await prisma.liveRoom.findFirst({
        where: { streamerId: user.id },
        select: { id: true }
      })

      if (!liveRoom) {
        return res.status(400).json({ success: false, message: '用户未创建直播间', productId: null, roomId: null })
      }

      const productId = await getRoomExplainingProduct(liveRoom.id)

      res.json({
        success: true,
        productId,
        roomId: liveRoom.id
      })
    }
  )
)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [商品]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: 商品不存在
 */
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

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: 创建商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *               - startingPrice
 *               - fixedIncrement
 *               - durationMinutes
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *                 example: "限量版球鞋"
 *               description:
 *                 type: string
 *                 description: 商品描述
 *                 example: "全新未拆封的限量版球鞋"
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *                 example: "https://example.com/shoe.jpg"
 *               startingPrice:
 *                 type: number
 *                 description: 起拍价
 *                 example: 100
 *               fixedIncrement:
 *                 type: number
 *                 description: 固定加价
 *                 example: 10
 *               maxPrice:
 *                 type: number
 *                 description: 最高价（可选）
 *                 example: 1000
 *               durationMinutes:
 *                 type: number
 *                 description: 拍卖时长（分钟）
 *                 example: 60
 *               extendSeconds:
 *                 type: number
 *                 description: 延时秒数
 *                 example: 120
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签
 *                 example: ["AUCTION", "FREE_SHIPPING"]
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: 更新商品信息
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *                 example: "限量版球鞋"
 *               description:
 *                 type: string
 *                 description: 商品描述
 *                 example: "全新未拆封的限量版球鞋"
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *                 example: "https://example.com/shoe.jpg"
 *               startingPrice:
 *                 type: number
 *                 description: 起拍价
 *                 example: 100
 *               fixedIncrement:
 *                 type: number
 *                 description: 固定加价
 *                 example: 10
 *               maxPrice:
 *                 type: number
 *                 description: 最高价
 *                 example: 1000
 *               durationMinutes:
 *                 type: number
 *                 description: 拍卖时长（分钟）
 *                 example: 60
 *               extendSeconds:
 *                 type: number
 *                 description: 延时秒数
 *                 example: 120
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签
 *                 example: ["AUCTION", "FREE_SHIPPING"]
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
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

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: 删除商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
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
 *         description: 商品不存在
 */
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

/**
 * @swagger
 * /api/v1/products/creator/{creatorId}:
 *   get:
 *     summary: 获取创建者的商品列表
 *     tags: [商品]
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: 创建者用户ID
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
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
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

/**
 * @swagger
 * /api/v1/products/{id}/status:
 *   patch:
 *     summary: 更新商品状态
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PUBLISHED]
 *                 description: 商品状态
 *                 example: "PUBLISHED"
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 *       404:
 *         description: 商品不存在
 */
router.patch(
  '/:id/status',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<{ id: string }, ProductResponse, { status: string }>,
      res: Response<ProductResponse>
    ) => {
      const user = requireAuth(req)
      const { status } = req.body

      if (!status || !['PENDING', 'PUBLISHED'].includes(status)) {
        return res.status(400).json({ message: '无效的状态值' } as unknown as ProductResponse)
      }

      const existing = await prisma.product.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '商品不存在' } as unknown as ProductResponse)
      }

      if (existing.creatorId !== user.id) {
        return res.status(403).json({ message: '无权限操作此商品' } as unknown as ProductResponse)
      }

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: { status: status as 'PENDING' | 'PUBLISHED' },
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
        ...updated,
        createdAt: updated.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/products/{id}/explaining:
 *   patch:
 *     summary: 切换商品讲解状态（使用Redis存储）
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start:
 *                 type: boolean
 *                 description: 是否开始讲解（默认true）
 *                 example: true
 *     responses:
 *       200:
 *         description: 切换成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 prevExplainingProductId:
 *                   type: string
 *                   nullable: true
 *                 roomId:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: 用户未创建直播间
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.patch(
  '/:id/explaining',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }, unknown, { start?: boolean }>, res: Response) => {
      const user = requireAuth(req)
      const { start = true } = req.body
      const productId = req.params.id

      const existing = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!existing) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }

      if (existing.creatorId !== user.id) {
        return res.status(403).json({ success: false, message: '无权限操作此商品' })
      }

      const liveRoom = await prisma.liveRoom.findFirst({
        where: { streamerId: user.id },
        select: { id: true }
      })

      if (!liveRoom) {
        return res.status(400).json({ success: false, message: '用户未创建直播间' })
      }

      const roomId = liveRoom.id
      let prevExplainingProductId: string | null = null

      if (start) {
        prevExplainingProductId = await getRoomExplainingProduct(roomId)

        if (prevExplainingProductId && prevExplainingProductId !== productId) {
          await clearRoomExplainingProduct(roomId)
        }

        await setRoomExplainingProduct(roomId, productId)
      } else {
        const currentExplaining = await getRoomExplainingProduct(roomId)
        if (currentExplaining === productId) {
          await clearRoomExplainingProduct(roomId)
        }
      }

      res.json({
        success: true,
        message: start ? '开始讲解成功' : '结束讲解成功',
        prevExplainingProductId,
        roomId
      })
    }
  )
)

/**
 * @swagger
 * /api/v1/products/{id}/start-auction:
 *   patch:
 *     summary: 开始竞拍
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 开始成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 商品状态不允许开始竞拍
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.patch(
  '/:id/start-auction',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }>, res: Response<ProductResponse>) => {
      const user = requireAuth(req)

      const existing = await prisma.product.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '商品不存在' } as unknown as ProductResponse)
      }

      if (existing.creatorId !== user.id) {
        return res.status(403).json({ message: '无权限操作此商品' } as unknown as ProductResponse)
      }

      if (existing.auctionStatus !== 'NOT_STARTED') {
        return res.status(400).json({ message: '商品竞拍已开始或已结束' } as unknown as ProductResponse)
      }

      const auctionEndTime = new Date(Date.now() + existing.durationMinutes * 60 * 1000)

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          auctionStatus: 'IN_PROGRESS',
          auctionStartTime: new Date(),
          auctionEndTime
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
        ...updated,
        createdAt: updated.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

/**
 * @swagger
 * /api/v1/products/{id}/end-auction:
 *   patch:
 *     summary: 结束竞拍
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 结束成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 商品竞拍未在进行中
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.patch(
  '/:id/end-auction',
  authMiddleware,
  wrapAuthHandler(
    async (req: Request<{ id: string }>, res: Response<ProductResponse>) => {
      const user = requireAuth(req)

      const existing = await prisma.product.findUnique({
        where: { id: req.params.id }
      })

      if (!existing) {
        return res.status(404).json({ message: '商品不存在' } as unknown as ProductResponse)
      }

      if (existing.creatorId !== user.id) {
        return res.status(403).json({ message: '无权限操作此商品' } as unknown as ProductResponse)
      }

      if (existing.auctionStatus !== 'IN_PROGRESS') {
        return res.status(400).json({ message: '商品竞拍未在进行中' } as unknown as ProductResponse)
      }

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          auctionStatus: 'ENDED',
          auctionEndTime: new Date()
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
        ...updated,
        createdAt: updated.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

export default router
