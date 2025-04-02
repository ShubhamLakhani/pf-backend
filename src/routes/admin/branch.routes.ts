import { Router } from 'express';
import {
  createBranch,
  getBranchList,
  removeBranch,
} from '../../controllers/admin/branch.controller';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();

/**
 * @swagger
 * /api/admin/branch/create:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin branch create
 *     tags: [ Admin-Branch ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "surat"
 *     responses:
 *       200:
 *         description: Branch created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', adminAuth, createBranch);

/**
 * @swagger
 * /api/admin/branch/delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin branch delete by ID
 *     tags: [ Admin-Branch ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branch to delete.
 *     responses:
 *       200:
 *         description: Admin branch deleted successfully
 *       404:
 *         description: branch not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete/:id', adminAuth, removeBranch);

/**
 * @swagger
 * /api/admin/branch/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin/Web all branch list
 *     tags: [ Admin-Branch ]
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
 *         description: Admin/Web branch list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', adminAuth, getBranchList);

export default router;
