import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { ProductStatus } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../../middleware/auth'

export enum ProductTag {
  LATE_COMPENSATION = 'LATE_COMPENSATION',
  FREE_SHIPPING = 'FREE_SHIPPING',
  SHIPPING_INSURANCE = 'SHIPPING_INSURANCE',
  AUCTION = 'AUCTION'
}
import {
  scheduleAuctionExpire,
  cancelAuctionExpire,
  settleProductAuction
} from '../../services/auctionExpire.service'

const router = Router()

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [商品]
 *     summary: 获取商品列表
 *     description: 支持分页和筛选查询，可以按商品状态和创建人ID筛选
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码，从1开始
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PUBLISHED]
 *         description: 商品状态 (PENDING:待审核 PUBLISHED:已发布)
 *       - in: query
 *         name: creatorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 创建人ID，用于查询某个直播间的商品
 *     responses:
 *       200:
 *         description: 成功获取商品列表
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
 *                   type: integer
 *                   description: 总记录数
 *                 page:
 *                   type: integer
 *                   description: 当前页码
 *                 pageSize:
 *                   type: integer
 *                   description: 每页数量
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { page = '1', pageSize = '10', status, creatorId } = req.query
    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const skip = (pageNum - 1) * pageSizeNum

    const where: any = {}
    if (status !== undefined) {
      where.status = status
    }
    if (creatorId !== undefined) {
      where.creatorId = creatorId as string
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              phone: true,
              nickname: true
            }
          },
          _count: {
            select: { auctions: true }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    res.json({ list: products, total, page: pageNum, pageSize: pageSizeNum })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags: [商品]
 *     summary: 获取商品详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 成功获取商品详情
 *       404:
 *         description: 商品不存在
 */
router.get('/:id', async (req: Request, res: Response, next: Function) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        },
        auctions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!product) {
      return res.status(404).json({ message: '商品不存在' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     tags: [商品]
 *     summary: 创建商品
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *               startingPrice:
 *                 type: number
 *                 description: 起拍价
 *               fixedIncrement:
 *                 type: number
 *                 description: 固定加价幅度
 *               maxPrice:
 *                 type: number
 *                 description: 最高限价
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表 (LATE_COMPENSATION, FREE_SHIPPING, SHIPPING_INSURANCE, AUCTION)
 *               durationMinutes:
 *                 type: number
 *                 description: 竞拍时长（分钟）
 *               extendSeconds:
 *                 type: number
 *                 description: 自动延长时间（秒）
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const {
      name,
      image,
      startingPrice,
      fixedIncrement,
      maxPrice,
      tags,
      durationMinutes,
      extendSeconds
    } = req.body

    if (!name || !image) {
      return res.status(400).json({ message: '商品名称和图片不能为空' })
    }

    const parsedTags = Array.isArray(tags)
      ? tags.filter((tag: string) => Object.values(ProductTag).includes(tag as ProductTag))
      : []

    const product = await prisma.product.create({
      data: {
        creatorId: req.user.id,
        name,
        image,
        startingPrice: startingPrice || 0,
        fixedIncrement: fixedIncrement || 10,
        maxPrice: maxPrice || null,
        tags: parsedTags,
        durationMinutes: durationMinutes || 60,
        extendSeconds: extendSeconds || 15,
        status: ProductStatus.PENDING
      }
    })

    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     tags: [商品]
 *     summary: 更新商品信息
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *               startingPrice:
 *                 type: number
 *                 description: 起拍价
 *               fixedIncrement:
 *                 type: number
 *                 description: 固定加价幅度
 *               maxPrice:
 *                 type: number
 *                 description: 最高限价
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               durationMinutes:
 *                 type: number
 *                 description: 竞拍时长（分钟）
 *               extendSeconds:
 *                 type: number
 *                 description: 自动延长时间（秒）
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const { id } = req.params
    const {
      name,
      image,
      startingPrice,
      fixedIncrement,
      maxPrice,
      tags,
      durationMinutes,
      extendSeconds
    } = req.body

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({ message: '商品不存在' })
    }

    if (existingProduct.creatorId !== req.user.id) {
      return res.status(403).json({ message: '没有权限修改此商品' })
    }

    let updateData: any = {
      name: name || existingProduct.name,
      image: image || existingProduct.image,
      startingPrice: startingPrice || existingProduct.startingPrice,
      fixedIncrement: fixedIncrement || existingProduct.fixedIncrement,
      maxPrice: maxPrice !== undefined ? maxPrice : existingProduct.maxPrice,
      durationMinutes:
        durationMinutes !== undefined ? durationMinutes : existingProduct.durationMinutes,
      extendSeconds: extendSeconds !== undefined ? extendSeconds : existingProduct.extendSeconds
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags.filter((tag: string) => Object.values(ProductTag).includes(tag as ProductTag))
        : existingProduct.tags
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    res.json(product)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     tags: [商品]
 *     summary: 删除商品
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
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }

    const { id } = req.params

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({ message: '商品不存在' })
    }

    if (existingProduct.creatorId !== req.user.id) {
      return res.status(403).json({ message: '没有权限删除此商品' })
    }

    await prisma.product.delete({
      where: { id }
    })

    res.json({ message: '删除成功' })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/products/{id}/status:
 *   patch:
 *     tags: [商品]
 *     summary: 更新商品状态
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
 *                 description: 商品状态 (PENDING, PUBLISHED)
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 无效的状态值
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 商品不存在
 */
router.patch(
  '/:id/status',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: (err?: unknown) => void) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const { id } = req.params
      const { status } = req.body

      if (status === undefined || ![ProductStatus.PENDING, ProductStatus.PUBLISHED].includes(status)) {
        return res.status(400).json({ message: '无效的状态值' })
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' })
      }

      if (existingProduct.creatorId !== req.user.id) {
        return res.status(403).json({ message: '没有权限修改此商品' })
      }

      const product = await prisma.product.update({
        where: { id },
        data: { status }
      })

      res.json(product)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/v1/products/{id}/explaining:
 *   patch:
 *     tags: [商品]
 *     summary: 切换商品讲解状态
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
 *         description: 更新成功
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
  async (req: AuthRequest, res: Response, next: (err?: unknown) => void) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const { id } = req.params

      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' })
      }

      if (existingProduct.creatorId !== req.user.id) {
        return res.status(403).json({ message: '没有权限修改此商品' })
      }

      const product = await prisma.product.update({
        where: { id },
        data: { isExplaining: !existingProduct.isExplaining }
      })

      res.json(product)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/v1/products/{id}/start-auction:
 *   patch:
 *     tags: [商品]
 *     summary: 开始商品竞拍
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
 *         description: 竞拍开始成功
 *       400:
 *         description: 竞拍已在进行中或已结束
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
  async (req: AuthRequest, res: Response, next: (err?: unknown) => void) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const { id } = req.params

      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' })
      }

      if (existingProduct.creatorId !== req.user.id) {
        return res.status(403).json({ message: '没有权限修改此商品' })
      }

      if (existingProduct.auctionStatus === 'IN_PROGRESS') {
        return res.status(400).json({ message: '竞拍已在进行中' })
      }

      if (existingProduct.auctionStatus === 'ENDED') {
        return res.status(400).json({ message: '竞拍已结束' })
      }

      const now = new Date()
      const endTime = new Date(now.getTime() + existingProduct.durationMinutes * 60 * 1000)

      const auction = await prisma.auction.create({
        data: {
          sellerId: req.user.id,
          productId: id,
          title: existingProduct.name,
          startPrice: existingProduct.startingPrice,
          minIncrement: existingProduct.fixedIncrement,
          maxPrice: existingProduct.maxPrice || null,
          durationSeconds: existingProduct.durationMinutes * 60,
          autoExtendSeconds: existingProduct.extendSeconds,
          status: 1,
          startTime: now
        }
      })

      const product = await prisma.product.update({
        where: { id },
        data: {
          auctionStatus: 'IN_PROGRESS',
          auctionStartTime: now,
          auctionEndTime: endTime,
          currentBidPrice: existingProduct.startingPrice
        }
      })

      await scheduleAuctionExpire(id, auction.id, endTime)

      res.json({ product, auction })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/v1/products/{id}/end-auction:
 *   patch:
 *     tags: [商品]
 *     summary: 结束商品竞拍
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
 *         description: 竞拍结束成功
 *       400:
 *         description: 竞拍未在进行中
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
  async (req: AuthRequest, res: Response, next: (err?: unknown) => void) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' })
      }

      const { id } = req.params

      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' })
      }

      if (existingProduct.creatorId !== req.user.id) {
        return res.status(403).json({ message: '没有权限修改此商品' })
      }

      if (existingProduct.auctionStatus !== 'IN_PROGRESS') {
        return res.status(400).json({ message: '竞拍未在进行中' })
      }

      await cancelAuctionExpire(id)
      const result = await settleProductAuction(id)

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          auctions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      res.json({ product, result })
    } catch (error) {
      next(error)
    }
  }
)

export default router