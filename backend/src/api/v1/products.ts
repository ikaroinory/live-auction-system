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

router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { page = '1', pageSize = '10', status } = req.query
    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const skip = (pageNum - 1) * pageSizeNum

    const where = status !== undefined ? { status: status as ProductStatus } : {}

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