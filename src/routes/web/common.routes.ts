import { Router } from "express";
import { createContactUsRequest, createDeleteRequest } from "../../controllers/web/common.controller";
import { userAuth } from "../../middleware/userAuth";

const router = Router();


/**
 * @swagger
 * /api/web/create/delete-request:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: create delete request
 *     tags: [ Web-Delete-Request ]
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
 *               mobileNumber:
 *                 type: string
 *                 example: "7878787878"
 *     responses:
 *       200:
 *         description: Delete Request created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/create/delete-request', userAuth, createDeleteRequest);

/**
 * @swagger
 * /api/web/create/contact-us:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: create contact us request
 *     tags: [ Web-Contact-Us ]
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
 *               mobileNumber:
 *                 type: string
 *                 example: "surat"
 *               email:
 *                 type: string
 *                 example: "surat"
 *               address:
 *                 type: string
 *                 example: "surat"
 *     responses:
 *       200:
 *         description: Contact Us Request created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/create/contact-us', /* userAuth, */ createContactUsRequest);


export default router;