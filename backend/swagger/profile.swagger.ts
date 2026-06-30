/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Current User Profile APIs
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
 *     UpdateProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Kandarp Brahmbhatt
 *         email:
 *           type: string
 *           example: kandarp@gmail.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         password:
 *           type: string
 *           example: Password@123
 */

/**
 * @swagger
 * /api/profile/currentProfile:
 *   get:
 *     summary: Get Current User Profile
 *     description: Returns the authenticated user's profile.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: profile fatched successfully
 *               data:
 *                 _id: 685f1d4e987654321abcd123
 *                 name: Kandarp Brahmbhatt
 *                 email: kandarp@gmail.com
 *                 phone: "9876543210"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     summary: Update Current User Profile
 *     description: Update the authenticated user's profile information.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Profile updated successfully
 *               data:
 *                 _id: 685f1d4e987654321abcd123
 *                 name: Kandarp Brahmbhatt
 *                 email: kandarp@gmail.com
 *                 phone: "9876543210"
 *       400:
 *         description: Email already in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */