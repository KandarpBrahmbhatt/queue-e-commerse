import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()
// export const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

export const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// console.log("EMAIL_USER :",EMAIL_USER)
// console.log("EMAIL_PASS",EMAIL_PASS)
transporter.verify((error, success) => {
    if (error) {
        console.log("Email Configuration Error:", error);
    } else {
        console.log("Email Server Ready");
    }
});