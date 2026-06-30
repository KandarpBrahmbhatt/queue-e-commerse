/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Address Management APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - fullName
 *         - mobile
 *         - addressLine1
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         fullName:
 *           type: string
 *           example: Kandarp Brahmbhatt
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           example: 101, Shree Complex
 *         addressLine2:
 *           type: string
 *           example: Near SG Highway
 *         city:
 *           type: string
 *           example: Ahmedabad
 *         state:
 *           type: string
 *           example: Gujarat
 *         pincode:
 *           type: string
 *           example: "380015"
 *         country:
 *           type: string
 *           example: India
 *         isDefault:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/address/create:
 *   post:
 *     summary: Create Address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/address/get:
 *   get:
 *     summary: Get Logged-in User Addresses
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address list
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/address/update/{id}:
 *   put:
 *     summary: Update Address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */

/**
 * @swagger
 * /api/address/delete/{id}:
 *   delete:
 *     summary: Delete Address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */

/**
 * @swagger
 * /api/address/getAddressListing:
 *   get:
 *     summary: Get Address Listing using Aggregation
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address Listing
 */

/**
 * @swagger
 * /api/address/getAllAddressListing:
 *   get:
 *     summary: Get All Address Listing
 *     tags: [Address]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: All Address List
 */