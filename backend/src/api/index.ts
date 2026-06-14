import { Router } from 'express'
import authRouter from './v1/auth'
import liveRoomRouter from './v1/liveRoom'
import productRouter from './v1/products'
import bidRouter from './v1/bids'
import orderRouter from './v1/orders'

const router = Router()

router.use('/v1/auth', authRouter)
router.use('/v1/live-rooms', liveRoomRouter)
router.use('/v1/products', productRouter)
router.use('/v1/bids', bidRouter)
router.use('/v1/orders', orderRouter)

export default router
