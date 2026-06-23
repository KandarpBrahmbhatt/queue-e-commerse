import { body } from "express-validator";

export const signupValidation = [
    body("name")
        .notEmpty()
        .withMessage("Name is Required")
        .isLength({ min: 3 })
        .withMessage("Name must be atleast 3 charactors"),

    body("email")
        .notEmpty()
        .withMessage("Email is Required")
        .isEmail()
        .withMessage("Invalida  email format"),

    body("password")
        .notEmpty()
        .withMessage("password must be required")
        .isStrongPassword({
            minLength: 8,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("password must contain uppercase, lowercase and specialcharactor")
]


export const loginValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email must be required")
        .isEmail()
        .withMessage("invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password must be required")
]


export const sendOtpValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email must be required")
        .isEmail()
        .withMessage("invalid Email format")
]


export const verifiedOtpValidation = [
    body("otp")
        .notEmpty()
        .withMessage("otp is Required"),

    body("email")
        .notEmpty()
        .withMessage("Email is required")
]


export const resetPasswordValidation = [
    body("email")
        .notEmpty()
        .withMessage("email is required"),

    body("password")
        .notEmpty()
        .withMessage("password is required")
        .isStrongPassword({
            minLength: 8,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("password must contain uppercase lowercase number and special character")
]