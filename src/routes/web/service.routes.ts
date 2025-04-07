import { Router } from 'express';
import {
  getFrequentlyBookedItemList,
  getServiceConsultationPrice,
  getServiceItemDetails,
  getServiceItemList,
  getServiceList,
} from '../../controllers/web/service.controller';

const router = Router();

/**
 * @swagger
 * /api/web/service/list:
 *   get:
 *     summary: Get service list
 *     tags: [ Service ]
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', getServiceList);

/**
 * @swagger
 * /api/web/service/item-list/{id}:
 *   get:
 *     summary: Service item list
 *     tags: [ Service ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service to retrieve.
 *       - in: query
 *         name: petType
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
 *         description: Service item list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/item-list/:id', getServiceItemList);
/**
 * @swagger
 * /api/web/service/frequent-item-list:
 *   get:
 *     summary: Service item list
 *     tags: [ Service ]
 *     responses:
 *       200:
 *         description: Service item list get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/frequent-item-list', getFrequentlyBookedItemList);

/**
 * @swagger
 * /api/web/service/item-details/{id}:
 *   get:
 *     summary: service item details
 *     tags: [ Service ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service item to retrieve.
 *     responses:
 *       200:
 *         description: Service item details get successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/item-details/:id', getServiceItemDetails);

/**
 * @swagger
 * /api/web/service/consultation-price:
 *   get:
 *     summary: Get service consultation price
 *     tags: [ Service ]
 *     parameters:
 *       - in: query
 *         name: consultationType
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service price retrieved successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/consultation-price', getServiceConsultationPrice);

export default router;
