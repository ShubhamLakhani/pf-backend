import { Router } from 'express';
import multer from 'multer';
import {
  getBookingDetails,
  getBookingList,
  getConsultationList,
  getInquiryList,
  getServiceRecordList,
  getTravelDetails,
  getTravelList,
  updateServiceRecordData,
  updateTravelCertificate,
} from '../../controllers/admin/booking.controller';

const router = Router();
/**
 * @swagger
 * /api/admin/booking/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get booking list
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceItemId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: petId
 *         required: false
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
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', getBookingList);

/**
 * @swagger
 * /api/admin/booking/consultation-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get consultation list
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: toDate
 *         required: false
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
 *       - in: query
 *         name: consultationType
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultation retrieved successfully
 *       404:
 *         description: Consultation not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/consultation-list', getConsultationList);

/**
 * @swagger
 * /api/admin/booking/inquiry-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get inquiry list
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: toDate
 *         required: false
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
 *         description: inquiry retrieved successfully
 *       404:
 *         description: inquiry not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/inquiry-list', getInquiryList);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateServiceRecord:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The ID that refers to the booking.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         serviceItemId:
 *           type: string
 *           description: The service item's ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         lastDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-01-21T09:15:00Z"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *
 * /api/admin/booking/update-service-record:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a Service Record
 *     tags: [ Admin-Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRecord'
 *     responses:
 *       200:
 *         description: Service record updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update-service-record',
  multer({ storage: multer.memoryStorage() }).single('image'),
  updateServiceRecordData
);

/**
 * @swagger
 * /api/admin/booking/service-record-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get service record list
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceItemId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: petId
 *         required: false
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
 *         description: Service record retrieved successfully
 *       404:
 *         description: Service record not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/service-record-list', getServiceRecordList);

/**
 * @swagger
 * /api/admin/booking/booking-details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get Booking details
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/booking-details/:id', getBookingDetails);

/**
 * @swagger
 * /api/admin/booking/travel-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get travel list
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: petId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: travelType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Domestic, International]
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
 *         description: Travel retrieved successfully
 *       404:
 *         description: Travel not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/travel-list', getTravelList);

/**
 * @swagger
 * /api/admin/booking/travel-details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get Travel details
 *     tags: [ Admin-Booking ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Travel retrieved successfully
 *       404:
 *         description: Travel not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/travel-details/:id', getTravelDetails);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTravelCertificate:
 *       type: object
 *       required:
 *         - _id
 *         - travelCertificate
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID that refers to the travel booking.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         travelCertificate:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *
 * /api/admin/booking/update-travel-certificate:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a travel Record
 *     tags: [ Admin-Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTravelCertificate'
 *     responses:
 *       200:
 *         description: Travel certificate updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update-travel-certificate',
  multer({ storage: multer.memoryStorage() }).single('travelCertificate'),
  updateTravelCertificate
);

export default router;
