import { body } from "express-validator";

export const createAddressValidator = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Full name must be between 3 and 50 characters"),

    body("mobile")
        .notEmpty()
        .withMessage("Mobile number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid mobile number"),

    body("addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Address is required")
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required"),

    body("pincode")
        .notEmpty()
        .withMessage("Pincode is required")
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid pincode"),
];

export const updateAddressValidator = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Full name must be between 3 and 50 characters"),

    body("mobile")
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid mobile number"),

    body("addressLine1")
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),

    body("pincode")
        .optional()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid pincode"),
];  
