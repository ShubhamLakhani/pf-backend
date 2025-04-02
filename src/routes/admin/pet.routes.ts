import { Router } from 'express';
import { getAllPetList } from '../../controllers/admin/pet.controller';

const router = Router();

/**
 * @swagger
 * /api/admin/pet/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin all pet list
 *     tags: [ Admin-Pet ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the user to retrieve.
 *       - in: query
 *         name: petType
 *         required: false
 *         schema:
 *           type: string
 *         description: The type of the pet to retrieve.
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: The userId of the pet to retrieve.
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
router.get('/list', getAllPetList);

export default router;
