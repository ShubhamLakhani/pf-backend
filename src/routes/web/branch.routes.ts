import { Router } from 'express';
import { getBranchList } from '../../controllers/admin/branch.controller';
import { userAuth } from '../../middleware/userAuth';

const router = Router();

/**
 * @swagger
 * /api/web/branch/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Web all branch list
 *     tags: [ Branch ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the branch to retrieve.
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
 *         description: Web branch list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', userAuth, getBranchList);

export default router;
