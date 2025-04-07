import { Router } from 'express';
import multer from 'multer';
import {
  addServiceRecord,
  createBooking,
  createConsultation,
  createInquiry,
  createTravel,
  getAllConsultationList,
  getBookingDetails,
  getBookingList,
  getConsultationList,
  getServiceRecordDetails,
  getServiceRecordList,
  getTravelList,
  getUpcomingConsultationDetails,
  updateConsultation,
  updateServiceRecord,
} from '../../controllers/web/booking.controller';
import { commonAuth } from '../../middleware/auth';
import { userAuth } from '../../middleware/userAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - petId
 *         - branchId
 *         - startDateTime
 *         - endDateTime
 *         - appointmentReason
 *       properties:
 *         serviceItemId:
 *           type: string
 *           description: The service item's ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         serviceId:
 *           type: string
 *           description: The service item's ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         petId:
 *           type: string
 *           description: The pet ID that refers to the service.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         branchId:
 *           type: string
 *           description: The pet ID that refers to the branch.
 *           example: "67af0689f9ff5d47b1d00345"
 *         startDateTime:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the booking.
 *           example: "2025-01-21T09:00:00Z"
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-01-21T09:15:00Z"
 *         appointmentReason:
 *           type: string
 *           description: The reason for the appointment.
 *           example: "For new grooming session"
 *         timeSlotLabel:
 *           type: string
 *           description: For time slot label.
 *
 * /api/web/booking/create:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new booking
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', userAuth, createBooking);

/**
 * @swagger
 * /api/web/booking/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get booking list
 *     tags: [ Booking ]
 *     parameters:
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
router.get('/list', userAuth, getBookingList);

/**
 * @swagger
 * components:
 *   schemas:
 *     Inquiry:
 *       type: object
 *       required:
 *         - name
 *         - mobileNumber
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           example: "Test"
 *         mobileNumber:
 *           type: string
 *           example: "9632569545"
 *         address:
 *           type: string
 *           example: "Some on planet"
 *
 * /api/web/booking/create-inquiry:
 *   post:
 *     summary: Create a new inquiry
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inquiry'
 *     responses:
 *       201:
 *         description: Inquiry created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post('/create-inquiry', createInquiry);

/**
 * @swagger
 * components:
 *   schemas:
 *     Consultation:
 *       type: object
 *       required:
 *         - petId
 *         - startDateTime
 *         - endDateTime
 *         - appointmentReason
 *         - consultationType
 *       properties:
 *         petId:
 *           type: string
 *           description: The pet ID that refers to the service.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         startDateTime:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the booking.
 *           example: "2025-01-21T09:00:00Z"
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-01-21T09:15:00Z"
 *         appointmentReason:
 *           type: string
 *           description: The reason for the appointment.
 *           example: "For new grooming session"
 *         consultationType:
 *           type: string
 *           description: The type of the consultation
 *           example: "Normal"
 *
 * /api/web/booking/create-consultation:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new consultation
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Consultation'
 *     responses:
 *       201:
 *         description: Consultation created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post('/create-consultation', userAuth, createConsultation);

/**
 * @swagger
 * /api/web/booking/consultation-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get consultation list
 *     tags: [ Booking ]
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
router.get('/consultation-list', userAuth, getConsultationList);

/**
 * @swagger
 * /api/web/booking/all-consultation-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all consultation list
 *     tags: [ Booking ]
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
router.get('/all-consultation-list', commonAuth, getAllConsultationList);

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceRecord:
 *       type: object
 *       required:
 *         - serviceId
 *         - petId
 *         - lastDateTime
 *         - image
 *       properties:
 *         serviceId:
 *           type: string
 *           description: The service ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         serviceItemId:
 *           type: string
 *           description: The service item's ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         petId:
 *           type: string
 *           description: The pet ID that refers to the service.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         lastDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-01-21T09:15:00Z"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         name:
 *           type: string
 *           description: The name of the service item record.
 *
 * /api/web/booking/service-record:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a service Record
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRecord'
 *     responses:
 *       201:
 *         description: Service record created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/service-record',
  userAuth,
  multer({ storage: multer.memoryStorage() }).single('image'),
  addServiceRecord
);

/**
 * @swagger
 * /api/web/booking/service-record-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get service record list
 *     tags: [ Booking ]
 *     parameters:
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
 *         name: petId
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
router.get('/service-record-list', userAuth, getServiceRecordList);

/**
 * @swagger
 * /api/web/booking/service-record-details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get service record details
 *     tags: [ Booking ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
router.get('/service-record-details/:id', userAuth, getServiceRecordDetails);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateServiceRecord:
 *       type: object
 *       required:
 *         - serviceId
 *       properties:
 *         serviceId:
 *           type: string
 *           description: The service ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         serviceItemId:
 *           type: string
 *           description: The service item's ref that is used for booking.
 *           example: "678f68e399a56f25c6ac53be"
 *         petId:
 *           type: string
 *           description: The pet ID that refers to the service.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         lastDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-01-21T09:15:00Z"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         name:
 *           type: string
 *           description: The name of the service item record.
 *
 * /api/web/booking/service-record:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a service Record
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRecord'
 *     responses:
 *       201:
 *         description: Service record updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/service-record',
  userAuth,
  multer({ storage: multer.memoryStorage() }).single('image'),
  updateServiceRecord
);

/**
 * @swagger
 * /api/web/booking/booking-details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get Booking details
 *     tags: [ Booking ]
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
router.get('/booking-details/:id', userAuth, getBookingDetails);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateConsultation:
 *       type: object
 *       required:
 *         - _id
 *         - startDateTime
 *         - endDateTime
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID that refers to the consultation.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         startDateTime:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the booking.
 *           example: "2025-03-28T09:00:00Z"
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the booking.
 *           example: "2025-03-28T09:15:00Z"
 *
 * /api/web/booking/update-consultation:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a new consultation
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConsultation'
 *     responses:
 *       201:
 *         description: Consultation updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch('/update-consultation', userAuth, updateConsultation);

/**
 * @swagger
 * /api/web/booking/upcoming-consultation-details:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get upcoming consultation details
 *     tags: [ Booking ]
 *     parameters:
 *       - in: query
 *         name: consultationType
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upcoming consultation retrieved successfully
 *       404:
 *         description: Upcoming consultation not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  '/upcoming-consultation-details',
  userAuth,
  getUpcomingConsultationDetails
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Travel:
 *       type: object
 *       required:
 *         - petId
 *         - travelType
 *         - travelDate
 *         - vaccinationRecord
 *         - isFitToTravelCertificate
 *         - isHealthCertificate
 *       properties:
 *         petId:
 *           type: string
 *           description: The pet ID that refers to the service.
 *           example: "6788a3b991358b4ffc45d0a7"
 *         travelType:
 *           type: string
 *           enum: [Domestic, International]
 *           description: The travel type.
 *         travelDate:
 *           type: string
 *           format: date
 *           description: The travel date.
 *           example: "2025-01-21"
 *         vaccinationRecord:
 *           type: string
 *           format: binary
 *         isFitToTravelCertificate:
 *           type: boolean
 *         isHealthCertificate:
 *           type: boolean
 *         isBloodTiterTest:
 *           type: boolean
 *         isNoObjectionCertificate:
 *           type: boolean
 *         requiredCertificates:
 *           type: string
 *
 * /api/web/booking/travel:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a travel data
 *     tags: [ Booking ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Travel'
 *     responses:
 *       201:
 *         description: Travel created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/travel',
  userAuth,
  multer({ storage: multer.memoryStorage() }).single('vaccinationRecord'),
  createTravel
);

/**
 * @swagger
 * /api/web/booking/travel-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get tavel list
 *     tags: [ Booking ]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Travel retrieved successfully
 *       404:
 *         description: Travel not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/travel-list', userAuth, getTravelList);

export default router;
