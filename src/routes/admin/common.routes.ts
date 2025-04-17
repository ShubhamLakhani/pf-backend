import { Router } from "express";
import { getContactUsList, getDeleteRequestList } from "../../controllers/admin/common.controller";
import { adminAuth } from "../../middleware/adminAuth";

const router = Router();


/**
 * @swagger
 * /api/admin/list/contact-us:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Contact Us list
 *     tags: [ Admin-Contact-Us ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the contact us to retrieve.
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
 *         description: Contact Us list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/list/contact-us', adminAuth, getContactUsList);
/**
 * @swagger
 * /api/admin/list/delete-request:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete Request list
 *     tags: [ Admin-Delete-Request ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the Delete Request to retrieve.
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
 *         description: Delete Request list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/delete-request/list', adminAuth, getDeleteRequestList);

export default router;