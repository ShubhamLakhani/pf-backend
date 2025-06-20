import { Router } from 'express';
import {
  deleteUser,
  getBookingHistoryList,
  getNextVaccinationData,
  getUserDetails,
  resendOtp,
  updateUserDetails,
  validateAlternateMobileNumberOtp,
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
 *           description: mobile number
 *         alternateMobileNumber:
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

/**
 * @swagger
 * /api/web/user/delete:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: User removed
 *     tags: [ User ]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete', deleteUser);

/**
 * @swagger
 * /api/web/user/validate-alternate-mobile-number-otp:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Validate a alternet mobile number otp
 *     tags: [ User ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNumber:
 *                 type: string
 *               otp:
 *                 type: number
 *     responses:
 *       201:
 *         description: User alternate mobile number is validate successfully
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/validate-alternate-mobile-number-otp',
  validateAlternateMobileNumberOtp
);

/**
 * @swagger
 * /api/web/user/resend-alternate-mobile-number-otp:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: resend alternate mobile number otp
 *     tags: [ User ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: resend alternate mobile number otp successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/resend-alternate-mobile-number-otp', resendOtp);

/**
 * @swagger
 * /api/web/user/booking-history-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get booking history list
 *     tags: [ User ]
 *     parameters:
 *       - in: query
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Booking history retrieved successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/booking-history-list', getBookingHistoryList);

export default router;
