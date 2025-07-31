import { Router } from 'express';
import { userAuth } from '../../middleware/userAuth';
import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import petRoutes from './pet.routes';
import serviceRoutes from './service.routes';
import userRoutes from './user.routes';
import branchRoutes from './branch.routes';
import breedRoutes from './breed.routes';
import commonRoutes from './common.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pet', userAuth, petRoutes);
router.use('/service', serviceRoutes);
router.use('/booking', bookingRoutes);
router.use('/user', userAuth, userRoutes);
router.use('/branch', userAuth, branchRoutes);
router.use('/breed', userAuth, breedRoutes);
router.use('/', commonRoutes);

export default router;
