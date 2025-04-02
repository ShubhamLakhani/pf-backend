import { Router } from 'express';
import { signIn } from '../../controllers/admin/auth.controller';

const router = Router();

/**
 * @swagger
 * /api/admin/auth/sign-in:
 *   post:
 *     summary: Admin login
 *     tags: [ Admin-Auth ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "a@yopmail.com"
 *               password:
 *                 type: string
 *                 example: "a@123"
 *     responses:
 *       200:
 *         description: Admin sign-in successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/sign-in', signIn);

export default router;
