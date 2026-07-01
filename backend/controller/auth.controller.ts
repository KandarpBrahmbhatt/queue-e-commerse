import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User, { AuthRequest } from '../models/user.model'
import Role from '../models/role.model'
import genToken from '../config/token'
import { emailQueue } from '../queue/email.queue'
import { sendOTP } from '../services/email.service'
import { notificationQueue } from '../queue/notification.queue'
import { parseUserAgent } from '../utils/userAgent'
import LoginHistory, { LoginStatus } from '../models/loginHistory.model'
import Session from '../models/session.model'
import { PassThrough } from 'node:stream'

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

        // SECURITY AUDIT: Log first successful login attempt & create active session
        const userAgent = req.headers["user-agent"];
        const { browser, os, deviceName } = parseUserAgent(userAgent);
        const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

        await LoginHistory.create({
            userId: user._id,
            email: user.email,
            ipAddress,
            browser,
            os,
            deviceName,
            status: LoginStatus.SUCCESS,
            loginTime: new Date()
        });

        await Session.create({
            userId: user._id,
            refreshToken: RefreshToken,
            deviceName,
            browser,
            os,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return res.status(200).json({ message: "signup successfully", user, AccessToken, RefreshToken })
    } catch (error: any) {
        console.log("signup error", error)
        return res.status(500).json({ messsage: "signup error", error: error.message })
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log(req.body)

        // Parse client device information & IP address
        const userAgent = req.headers["user-agent"];
        const { browser, os, deviceName } = parseUserAgent(userAgent);
        const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

        if (!email || !password) {
            return res.status(400).json({ message: "all filed are required" })
        }

        const user = await User.findOne({ email }).populate({
            path: "role",
            populate: {
                path: "permissions"
            }
        });

        if (!user) {
            // SECURITY AUDIT: Log failed login (user not found)
            await LoginHistory.create({
                email,
                ipAddress,
                browser,
                os,
                deviceName,
                status: LoginStatus.FAILED,
                failureReason: "User not found",
                loginTime: new Date()
            });
            return res.status(400).json({ message: "user not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password,)
        if (!isMatch) {
            // SECURITY AUDIT: Log failed login (password incorrect)
            await LoginHistory.create({
                userId: user._id,
                email,
                ipAddress,
                browser,
                os,
                deviceName,
                status: LoginStatus.FAILED,
                failureReason: "Incorrect password",
                loginTime: new Date()
            });
            return res.status(400).json({ message: "password not match" })
        }
        const { AccessToken, RefreshToken } = genToken(user)

        // SECURITY ALERTS: Check for new device / IP location and trigger security alert enqueuing
        const lastSuccessfulLogin = await LoginHistory.findOne({
            userId: user._id,
            status: LoginStatus.SUCCESS
        }).sort({ createdAt: -1 });

        if (lastSuccessfulLogin) {
            const isNewIP = lastSuccessfulLogin.ipAddress !== ipAddress;
            const isNewDevice = lastSuccessfulLogin.deviceName !== deviceName || lastSuccessfulLogin.os !== os || lastSuccessfulLogin.browser !== browser;

            if (isNewIP || isNewDevice) {
                console.log(`[Security Alert] New device/IP detected for ${user.email}. Enqueuing alert...`);
                await notificationQueue.add("notification", {
                    email: user.email,
                    phone: user.phone,
                    subject: "Security Alert: New Login Detected",
                    html: `<h1>Security Alert</h1><p>Hi ${user.name}, we detected a new login to your account from a new IP or device:</p><ul><li><b>Device:</b> ${deviceName} (${os} - ${browser})</li><li><b>IP Address:</b> ${ipAddress}</li><li><b>Time:</b> ${new Date().toLocaleString()}</li></ul><p>If this was not you, please secure your account by changing your password immediately.</p>`,
                    sms: `Security Alert: New login detected on your account from ${deviceName} (IP: ${ipAddress}). If this wasn't you, change your password immediately.`
                });
            }
        }

        // SECURITY AUDIT: Log successful login
        await LoginHistory.create({
            userId: user._id,
            email: user.email,
            ipAddress,
            browser,
            os,
            deviceName,
            status: LoginStatus.SUCCESS,
            loginTime: new Date()
        });

        // SECURITY AUDIT: Save active user session
        await Session.create({
            userId: user._id,
            refreshToken: RefreshToken,
            deviceName,
            browser,
            os,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // enqueues regular login alert
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
        const info = req.deviceInfo;

        console.log(info);
    } catch (error) {
        console.log("login error", error)
        return res.status(500).json({ message: "login error", error })
    }
}


export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.RefreshToken;
        if (refreshToken) {
            // SECURITY AUDIT: Revoke active session on logout
            await Session.deleteOne({ refreshToken });
        }
        await res.clearCookie("AccessToken")
        await res.clearCookie("RefreshToken")
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



export const forgotPassword = async(req:AuthRequest,res:Response)=>{
    try {
        const userId = req.user?.userId
        const {oldPassword,newPassword} = req.body

        if (!oldPassword) {
            return res.status(400).json({message:"oldPassword not found"})
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).json({message:"ser not found"})
        }

        const isMatch = await bcrypt.compare(oldPassword,user.password)

        if (!isMatch) {
            return res.status(400).json({message:"old password is incoorect"})
        }

        const hashPassword = await bcrypt.hash(newPassword,10)
        user.password = hashPassword

        await user.save()

        return res.status(200).json({message:"forgot password sucessfully"})
    } catch (error:any) {
        console.log(`forgot password error ${error}`)
        return res.status(400).json({message:"forgotpassword error",error:error.message})
    }
}