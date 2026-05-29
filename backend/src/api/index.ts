import { Router } from 'express'
import authRouter from './v1/auth'
import auctionRouter from './v1/auction'
import liveRoomRouter from './v1/liveRoom'
import productRouter from './v1/products'

const router = Router()

router.use('/v1/auth', authRouter)
router.use('/v1/auctions', auctionRouter)
router.use('/v1/live-rooms', liveRoomRouter)
router.use('/v1/products', productRouter)

export default router
