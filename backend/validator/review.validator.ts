import { body } from "express-validator"

export const createReviewValidaror = [
    body("productId")
    .notEmpty()
    .withMessage("productId required"),

    body("rating")
    .notEmpty()
    .withMessage("Rating is required"),

    body("commet")
    .optional()
    .isLength({ max: 500 }),
]