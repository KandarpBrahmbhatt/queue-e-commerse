/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product Management APIs
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
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: iPhone 16 Pro
 *         slug:
 *           type: string
 *           example: iphone-16-pro
 *         description:
 *           type: string
 *           example: Apple flagship mobile
 *         sku:
 *           type: string
 *           example: IP16PRO001
 *         price:
 *           type: number
 *           example: 120000
 *         stock:
 *           type: number
 *           example: 50
 *         category:
 *           type: string
 *           example: 685f4a54c6b2b08c1d36d123
 */

/**
 * @swagger
 * /api/product/create:
 *   post:
 *     summary: Create Product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - description
 *               - sku
 *               - price
 *               - stock
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product Created
 *       400:
 *         description: Validation Error
 */

/**
 * @swagger
 * /api/product/get:
 *   get:
 *     summary: Get All Products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product List
 */

/**
 * @swagger
 * /api/product/currentProduct/{id}:
 *   get:
 *     summary: Get Product By ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product Details
 *       404:
 *         description: Product Not Found
 */

/**
 * @swagger
 * /api/product/update/{id}:
 *   put:
 *     summary: Update Product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product Updated
 */

/**
 * @swagger
 * /api/product/deleted/{id}:
 *   delete:
 *     summary: Delete Product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product Deleted
 */

/**
 * @swagger
 * /api/product/getAggregationProduct:
 *   get:
 *     summary: Get Products using Aggregation
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Aggregated Product List
 */

/**
 * @swagger
 * /api/product/recent:
 *   get:
 *     summary: Get Recently Viewed Products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent Viewed Products
 */

/**
 * @swagger
 * /api/product/recent:
 *   delete:
 *     summary: Clear Recently Viewed Products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent Views Cleared
 */