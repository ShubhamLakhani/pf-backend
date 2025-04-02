import { Router } from 'express';
import multer from 'multer';
import {
  createPet,
  deletePet,
  getPetDetails,
  getPetList,
  updatePet,
} from '../../controllers/web/pet.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - image
 *         - petType
 *         - breed
 *         - sex
 *         - weight
 *         - size
 *         - age
 *         - neutered
 *         - friendly
 *       properties:
 *         name:
 *           type: string
 *           description: The pet's name.
 *           example: "Fluffy"
 *         image:
 *           type: string
 *           format: binary
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         petType:
 *           type: string
 *           enum: ["Pet", "Dog"]
 *           description: The type of pet.
 *           example: "Dog"
 *         breed:
 *           type: string
 *           description: The pet's breed.
 *           example: "Golden Retriever"
 *         sex:
 *           type: string
 *           enum: ["Male", "Female"]
 *           description: The pet's sex.
 *           example: "Female"
 *         weight:
 *           type: number
 *           format: float
 *           description: The pet's weight in kilograms.
 *           example: 25.5
 *         size:
 *           type: string
 *           enum: ["Small", "Medium", "Large"]
 *           description: The pet's size.
 *           example: "Medium"
 *         age:
 *           type: number
 *           description: The pet's age in years.
 *           example: 3
 *         neutered:
 *           type: string
 *           enum: ["Yes", "No", "Not Sure"]
 *           description: Whether the pet is neutered.
 *           example: "Yes"
 *         friendly:
 *           type: string
 *           enum: ["Very", "Aggressive", "Dependable"]
 *           description: Whether the pet is friendly.
 *           example: "Very"
 *
 * /api/web/pet/create:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new pet
 *     tags: [ Pet ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: Pet created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/create',
  multer({ storage: multer.memoryStorage() }).single('image'),
  createPet
);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The id of pet to update.
 *           example: "6780e9b332ff889239aaf3ca"
 *         name:
 *           type: string
 *           description: The pet's name.
 *           example: "Fluffy"
 *         image:
 *           type: string
 *           format: binary
 *           nullable: true
 *           description: The image file for the pet (e.g., JPG, PNG).
 *         petType:
 *           type: string
 *           enum: ["Pet", "Dog"]
 *           description: The type of pet.
 *           example: "Dog"
 *         breed:
 *           type: string
 *           description: The pet's breed.
 *           example: "Golden Retriever"
 *         sex:
 *           type: string
 *           enum: ["Male", "Female"]
 *           description: The pet's sex.
 *           example: "Female"
 *         weight:
 *           type: number
 *           format: float
 *           description: The pet's weight in kilograms.
 *           example: 25.5
 *         size:
 *           type: string
 *           enum: ["Small", "Medium", "Large"]
 *           description: The pet's size.
 *           example: "Medium"
 *         age:
 *           type: number
 *           description: The pet's age in years.
 *           example: 3
 *         neutered:
 *           type: string
 *           enum: ["Yes", "No", "Not Sure"]
 *           description: Whether the pet is neutered.
 *           example: "Yes"
 *         friendly:
 *           type: string
 *           enum: ["Very", "Aggressive", "Dependable"]
 *           description: Whether the pet is friendly.
 *           example: "Very"
 *
 * /api/web/pet/update:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a  pet
 *     tags: [ Pet ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePet'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/update',
  multer({ storage: multer.memoryStorage() }).single('image'),
  updatePet
);

/**
 * @swagger
 * /api/web/pet/details/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get pet details by ID
 *     tags: [ Pet ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pet to retrieve.
 *         example: "6780e9b332ff889239aaf3ca"
 *     responses:
 *       200:
 *         description: Pet details retrieved successfully
 *       404:
 *         description: Pet not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/details/:id', getPetDetails);

/**
 * @swagger
 * /api/web/pet/list:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get pet list
 *     tags: [ Pet ]
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the pet to retrieve.
 *       - in: query
 *         name: petType
 *         required: false
 *         schema:
 *           type: string
 *         description: The type of the pet to retrieve.
 *     responses:
 *       200:
 *         description: Pets retrieved successfully
 *       404:
 *         description: Pet not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', getPetList);

/**
 * @swagger
 * /api/web/pet/delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Pet delete by ID
 *     tags: [ Pet ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pet to retrieve.
 *         example: "6780e9b332ff889239aaf3ca"
 *     responses:
 *       200:
 *         description: Pet deleted successfully
 *       404:
 *         description: Pet not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete/:id', deletePet);

export default router;
