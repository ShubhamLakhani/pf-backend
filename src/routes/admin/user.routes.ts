import { Router } from 'express';
import {
  getAllUserList,
  getUserDetails,
} from '../../controllers/admin/user.controller';

const router = Router();

/**
 * @swagger
 * /api/admin/user/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin all user list
 *     tags: [ Admin-User ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the user to retrieve.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin user list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', getAllUserList);

/**
 * @swagger
 * /api/admin/user/details/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin user details
 *     tags: [ Admin-User ]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin user details get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/details/:userId', getUserDetails);

export default router;
