import { Router } from 'express';
import {
  getNextVaccinationData,
  getUserDetails,
  updateUserDetails,
} from '../../controllers/web/user.controller';
import multer from 'multer';

const router = Router();

/**
 * @swagger
 * /api/web/user/details/:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: user details
 *     tags: [ User ]
 *     responses:
 *       200:
 *         description: user details get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/details', getUserDetails);

/**
 * @swagger
 * /api/web/user/next-vaccination/:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: user next vaccination data
 *     tags: [ User ]
 *     parameters:
 *       - in: query
 *         name: petId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: user next vaccination data get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/next-vaccination', getNextVaccinationData);

/**
 * @swagger
 * components:
 *   schemas:
 *     userUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the profile (e.g., JPG, PNG).
 *         mobileNumber:
 *           type: string
 *         address:
 *           type: string
 *
 * /api/web/user/update/:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update user details
 *     tags: [ User ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/userUpdate'
 *     responses:
 *       200:
 *         description: User details updated successfully
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update',
  multer({ storage: multer.memoryStorage() }).single('image'),
  updateUserDetails
);

export default router;
