import { Router } from 'express';
import { adminAuth } from '../../middleware/adminAuth';
import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import branchRoutes from './branch.routes';
import petRoutes from './pet.routes';
import serviceRoutes from './service.routes';
import userRoutes from './user.routes';
import commonRoutes from './common.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', adminAuth, userRoutes);
router.use('/pet', adminAuth, petRoutes);
router.use('/service', adminAuth, serviceRoutes);
router.use('/booking', adminAuth, bookingRoutes);
router.use('/branch', branchRoutes);
router.use('/', adminAuth, commonRoutes);


export default router;
