import { Router } from 'express';
import {
  resendOtp,
  signIn,
  signUp,
  validateSignInOtp,
  validateSignUpOtp,
} from '../../controllers/web/auth.controller';

const router = Router();

/**
 * @swagger
 * /api/web/auth/sign-up:
 *   post:
 *     summary: Create a new user
 *     tags: [ Auth ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User sign-up otp send successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/sign-up', signUp);

/**
 * @swagger
 * /api/web/auth/validate-sign-up-otp:
 *   post:
 *     summary: Validate a new user sign up otp
 *     tags: [ Auth ]
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
 *         description: User sign up OTP validate successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/validate-sign-up-otp', validateSignUpOtp);

/**
 * @swagger
 * /api/web/auth/sign-in:
 *   post:
 *     summary: User login
 *     tags: [ Auth ]
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
 *       200:
 *         description: User sign-in otp send successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/sign-in', signIn);

/**
 * @swagger
 * /api/web/auth/validate-sign-in-otp:
 *   post:
 *     summary: Validate a new user sign up otp
 *     tags: [ Auth ]
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
 *         description: User sign-in OTP validate successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/validate-sign-in-otp', validateSignInOtp);

/**
 * @swagger
 * /api/web/auth/resend-otp:
 *   post:
 *     summary: User send new OTP
 *     tags: [ Auth ]
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
 *       200:
 *         description: User otp send successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/resend-otp', resendOtp);

export default router;
