import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/user.model'
import Role from '../models/role.model'
import genToken from '../config/token'
import { emailQueue } from '../queue/email.queue'
import { sendOTP } from '../services/email.service'
import { notificationQueue } from '../queue/notification.queue'

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body
        console.log(req.body)

        if (!name || !email || !password) {
            return res.status(400).json({ message: "all field are required" })
        }

        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            return res.status(400).json({ message: "user already exist" })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const customerRole = await Role.findOne({
            name: "CUSTOMER"
        }).populate("permissions");

        const user = await User.create({
            name,
            email,
            password: hashPassword,
            phone,
            role: customerRole?._id
        });

        // Populate user role and permissions for token generation
        if (customerRole) {
            await user.populate({
                path: "role",
                populate: {
                    path: "permissions"
                }
            });
        }

        //producer welcome email + SMS enqueuing
        await notificationQueue.add("notification", {
            email: user.email,
            phone: user.phone,
            subject: "Welcome to Queue E-Commerce",
            html: `<h1>Welcome to Queue E-Commerce!</h1><p>Hi ${user.name}, thank you for registering with us.</p>`,
            sms: `Hi ${user.name}, welcome to Queue E-Commerce! Thank you for registering.`
        });

        // Retry Mechanism =>BullMQ supports retries automatically.

        await emailQueue.add(
            "welcome-email",
            user,
            {
                attempts: 3
            }
        );

        // Delayed Jobs => Run jobs after a delay.

        emailQueue.add(
            "reminder-email",
            user,
            {
                delay: 60 * 60 * 1000
            }
        );

        // Repeatable Jobs =>Example: Generate daily reports.

        emailQueue.add("daily-report", {}, {
            repeat: {
                every: 24 * 60 * 60 * 1000
            }
        }
        );
        // await emailQueue.add("welcome-email", {
        //     email: user.email,
        //     name: user.name,
        // },
        //     {
        //         attempts: 5,
        //         backoff: {
        //             type: "exponential",
        //             delay: 5000
        //         },
        //         removeOnComplete: 100,
        //         removeOnFail: 50
        //     })

        const { AccessToken, RefreshToken } = genToken(user)
        res.cookie("AccessToken", AccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            }
        );

        res.cookie("RefreshToken", RefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({ message: "signup successfully", user, AccessToken, RefreshToken })
    } catch (error:any) {
        console.log("signup error", error)
        return res.status(500).json({ messsage: "signup error", error:error.message })
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log(req.body)

        if (!email || !password) {
            return res.status(400).json({ message: "all filed are required" })
        }

        const user = await User.findOne({ email }) .populate({
                path: "role",
                populate: {
                    path: "permissions"
                }
            });

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password,)
        if (!isMatch) {
            return res.status(400).json({ message: "password not match" })
        }
        const { AccessToken, RefreshToken } = genToken(user)

        // enqueues login email and SMS
        await notificationQueue.add("notification", {
            email: user.email,
            phone: user.phone,
            subject: "Login Alert",
            html: `<h1>Login Alert</h1><p>Hi ${user.name}, you have successfully logged in to your account.</p>`,
            sms: `Hi ${user.name}, you have successfully logged in to your Queue E-Commerce account.`
        });
        res.cookie("AccessToken", AccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            }
        );

        res.cookie("RefreshToken", RefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({ message: "login sucessfully", user, AccessToken, RefreshToken })
    } catch (error) {
        console.log("login error", error)
        return res.status(500).json({ message: "login error", error })
    }
}


export const logout = async (req: Request, res: Response) => {
    try {
        await res.clearCookie("Accesstoken")
        return res.status(200).json({ message: "logout sucessfully" })

    } catch (error) {
        console.log(`logout error ${error}`)
        return res.status(500).json({ message: "logout error", error })
    }
}


export const sendotp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "email not found" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        user.resetOtp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // convert 5 min into milisecond
        user.isOtpVerifed = false;

        await user.save()

        await sendOTP(email, otp)
        return res.status(200).json({ message: "email successfully send", otp })

    } catch (error) {
        console.log(`sendOtp error ${error}`)
        return res.status(500).json({ message: "send otp error" })
    }
}


export const verifiedOtp = async (req: Request, res: Response) => {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({
                message: "OTP and email are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const isOtpMatch = user.resetOtp === String(otp);

        const isOtpExpired = !user.otpExpires || user.otpExpires.getTime() < Date.now();

        if (!isOtpMatch) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (isOtpExpired) {
            return res.status(400).json({
                message: "OTP has expired",
            });
        }

        user.isOtpVerifed = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully",
        });

    } catch (error) {
        console.log("verified otp error:", error);

        return res.status(500).json({
            message: "OTP verification error",
            error,
        });
    }
};


export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerifed) {
            return res.status(400).json({ message: "OTP verfication required" })
        }

        //  Password Strength Check
        // if (!isStrongPassword(password)) {
        //     return res.status(400).json({
        //         message:
        //             "Password must be 8+ characters with uppercase, lowercase, number & special character",
        //     });
        // }

        const hashPassword = await bcrypt.hash(password, 10)
        user.password = hashPassword
        user.isOtpVerifed = false
        await user.save()
        return res.status(200).json({ message: "Password Reset Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Reset Password error ${error}` })
    }
}



