import { Router } from 'express';
import { userAuth } from '../../middleware/userAuth';
import { getBreedList } from '../../controllers/web/breed.controller';

const router = Router();

/**
 * @swagger
 * /api/web/breed/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Web all breed list
 *     tags: [ Breed ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the breed to retrieve.
 *       - in: query
 *         name: petType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Web branch list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', userAuth, getBreedList);

export default router;
