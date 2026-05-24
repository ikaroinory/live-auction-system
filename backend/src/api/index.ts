import { Router } from 'express';
import authRouter from './v1/auth';
import auctionRouter from './v1/auction';

const router = Router();

router.use('/v1/auth', authRouter);
router.use('/v1/auctions', auctionRouter);

export default router;
