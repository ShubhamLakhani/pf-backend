import { Request, Response, Router } from 'express';
import adminRoutes from './admin/index.routes';
import webRoutes from './web/index.routes';
import webhookRoutes from './webhook/index.routes';

const router = Router();

// Health Check Route
router.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

router.use('/web', webRoutes);
router.use('/admin', adminRoutes);
router.use('/webhook', webhookRoutes);

export default router;
