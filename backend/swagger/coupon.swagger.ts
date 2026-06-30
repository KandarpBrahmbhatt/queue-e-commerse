/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon Management APIs
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
 *     CreateCoupon:
 *       type: object
 *       required:
 *         - code
 *         - discountType
 *         - discountValue
 *         - minOrderValue
 *       properties:
 *         code:
 *           type: string
 *           example: SAVE20
 *         discountType:
 *           type: string
 *           enum:
 *             - PERCENTAGE
 *             - FIXED
 *           example: PERCENTAGE
 *         discountValue:
 *           type: number
 *           example: 20
 *         minOrderValue:
 *           type: number
 *           example: 1000
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     ApplyCoupon:
 *       type: object
 *       required:
 *         - code
 *         - cartTotal
 *       properties:
 *         code:
 *           type: string
 *           example: SAVE20
 *         cartTotal:
 *           type: number
 *           example: 2500
 */

/**
 * @swagger
 * /api/coupon/create:
 *   post:
 *     summary: Create Coupon
 *     description: Create a new coupon.
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCoupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Coupon already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/coupon/apply:
 *   post:
 *     summary: Apply Coupon
 *     description: Apply a coupon to the authenticated user's cart.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyCoupon'
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon or minimum order value not met
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/coupon/list:
 *   get:
 *     summary: Get Active Coupons
 *     description: Returns all active coupons.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active coupons
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/coupon/getAllAggregateCoupen:
 *   get:
 *     summary: Get Coupon List with Aggregation
 *     description: Returns paginated coupon data using MongoDB aggregation.
 *     tags: [Coupon]
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
 *         description: Coupon list retrieved successfully
 *       500:
 *         description: Internal server error
 */