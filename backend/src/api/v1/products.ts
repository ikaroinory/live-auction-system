import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/auth'

const router = Router()

router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const { page = '1', pageSize = '10', status } = req.query
    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const skip = (pageNum - 1) * pageSizeNum

    const where = status !== undefined ? { status: parseInt(status as string) } : {}

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
      lateCompensation,
      freeShipping,
      shippingInsurance,
      auction
    } = req.body

    if (!name || !image) {
      return res.status(400).json({ message: '商品名称和图片不能为空' })
    }

    const product = await prisma.product.create({
      data: {
        creatorId: req.user.id,
        name,
        image,
        startingPrice: startingPrice || 0,
        fixedIncrement: fixedIncrement || 10,
        maxPrice: maxPrice || null,
        lateCompensation: lateCompensation || false,
        freeShipping: freeShipping || false,
        shippingInsurance: shippingInsurance || false,
        auction: auction || false,
        status: 0
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
      lateCompensation,
      freeShipping,
      shippingInsurance,
      auction
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        image: image || existingProduct.image,
        startingPrice: startingPrice || existingProduct.startingPrice,
        fixedIncrement: fixedIncrement || existingProduct.fixedIncrement,
        maxPrice: maxPrice !== undefined ? maxPrice : existingProduct.maxPrice,
        lateCompensation:
          lateCompensation !== undefined ? lateCompensation : existingProduct.lateCompensation,
        freeShipping: freeShipping !== undefined ? freeShipping : existingProduct.freeShipping,
        shippingInsurance:
          shippingInsurance !== undefined ? shippingInsurance : existingProduct.shippingInsurance,
        auction: auction !== undefined ? auction : existingProduct.auction
      }
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

      if (status === undefined || ![0, 1].includes(status)) {
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
      const endTime = new Date(now.getTime() + existingProduct.auctionDuration * 1000)

      const product = await prisma.product.update({
        where: { id },
        data: {
          auctionStatus: 'IN_PROGRESS',
          auctionStartTime: now,
          auctionEndTime: endTime,
          currentBidPrice: existingProduct.startingPrice
        }
      })

      res.json(product)
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

      const product = await prisma.product.update({
        where: { id },
        data: {
          auctionStatus: 'ENDED',
          auctionEndTime: new Date()
        }
      })

      res.json(product)
    } catch (error) {
      next(error)
    }
  }
)

export default router
