import { Router } from 'express';
import multer from 'multer';
import {
  createServiceItem,
  deleteServiceItem,
  getServiceItemDetails,
  getServiceItemList,
  setServiceConsultationPrice,
  updateService,
  updateServiceItem,
} from '../../controllers/admin/service.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceItem:
 *       type: object
 *       required:
 *         - serviceId
 *         - name
 *         - amount
 *         - metaData
 *       properties:
 *         serviceId:
 *           type: string
 *           description: The service's ID.
 *         name:
 *           type: string
 *           description: The service's name.
 *           example: "Puppy DP vaccine"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         amount:
 *           type: number
 *           description: The amount of service item.
 *           example: 100
 *         discountedAmount:
 *           type: number
 *           description: The service item discount amount.
 *           example: 0
 *         metaData:
 *           type: object
 *           description: The service item meta data.
 *
 * /api/admin/service/create-item:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin create service item
 *     tags: [ Admin-Service ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ServiceItem'
 *     responses:
 *       200:
 *         description: Service item created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/create-item',
  multer({ storage: multer.memoryStorage() }).single('image'),
  createServiceItem
);

/**
 * @swagger
 * /api/admin/service/item-list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin all service item list
 *     tags: [ Admin-Service ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the service to retrieve.
 *       - in: query
 *         name: serviceId
 *         required: false
 *         schema:
 *           type: string
 *         description: The serviceId of the pet to retrieve.
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
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Admin service item list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/item-list', getServiceItemList);

/**
 * @swagger
 * /api/admin/service/item-details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin service item details
 *     tags: [ Admin-Service ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service item to retrieve.
 *     responses:
 *       200:
 *         description: Admin service item details get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/item-details/:id', getServiceItemDetails);

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceItemUpdate:
 *       type: object
 *       required:
 *         - metaData
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of pet to update.
 *           example: "678f5f84f7fc02ab9c644f25"
 *         name:
 *           type: string
 *           description: The service's name.
 *           example: "Puppy DP vaccine"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         amount:
 *           type: number
 *           description: The amount of service item.
 *           example: 100
 *         discountedAmount:
 *           type: number
 *           description: The service item discount amount.
 *           example: 0
 *         metaData:
 *           type: object
 *           description: The service item meta data.
 *
 * /api/admin/service/update-item:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin update service item
 *     tags: [ Admin-Service ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ServiceItemUpdate'
 *     responses:
 *       200:
 *         description: Service item updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update-item',
  multer({ storage: multer.memoryStorage() }).single('image'),
  updateServiceItem
);

/**
 * @swagger
 * /api/admin/service/item-delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin service item delete by ID
 *     tags: [ Admin-Service ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service item to delete.
 *     responses:
 *       200:
 *         description: Admin service item deleted successfully
 *       404:
 *         description: Service item not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/item-delete/:id', deleteServiceItem);

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceUpdate:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of pet to update.
 *           example: "678f5f84f7fc02ab9c644f25"
 *         name:
 *           type: string
 *           description: The service's name.
 *           example: "vaccine"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         mobileImage:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         amount:
 *           type: number
 *           description: The amount of service item.
 *           example: 100
 *         discountedAmount:
 *           type: number
 *           description: The service item discount amount.
 *           example: 0
 *         description:
 *           type: string
 *           description: The service's description.
 *           example: "Puppy DP vaccine"
 *
 * /api/admin/service/update:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin update service
 *     tags: [ Admin-Service ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ServiceUpdate'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update',
  multer({ storage: multer.memoryStorage() }).fields([
    {
      name: 'image',
      maxCount: 1,
    },
    {
      name: 'mobileImage',
      maxCount: 1,
    },
  ]),
  updateService
);

/**
 * @swagger
 * components:
 *   schemas:
 *     ServicePrice:
 *       type: object
 *       required:
 *         - amount
 *         - discountedAmount
 *       properties:
 *         amount:
 *           type: number
 *           description: The amount of service item.
 *           example: 100
 *         discountedAmount:
 *           type: number
 *           description: The service item discount amount.
 *           example: 0
 *
 * /api/admin/service/update-price:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Admin update service consultation price
 *     tags: [ Admin-Service ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicePrice'
 *     responses:
 *       200:
 *         description: Service price updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch('/update-price', setServiceConsultationPrice);

export default router;
