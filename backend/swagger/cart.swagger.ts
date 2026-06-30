/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping Cart APIs
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
 *     AddToCart:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: string
 *           example: 685d3aef5c6a9b0012ab3456
 *         quantity:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add Product to Cart
 *     description: Add a product to the authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCart'
 *     responses:
 *       200:
 *         description: Product added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/cart/get:
 *   get:
 *     summary: Get User Cart
 *     description: Returns all items in the authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove Product from Cart
 *     description: Remove a product from the authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: 685d3aef5c6a9b0012ab3456
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       404:
 *         description: Cart or Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */