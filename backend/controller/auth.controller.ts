import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/user.model'
import genToken from '../config/token'
import { emailQueue } from '../queue/email.queue'

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body
        console.log(req.body)

        if (!name || !email || !password) {
            return res.status(400).json({ message: "all field are required" })
        }

        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            return res.status(400).json({ message: "user already exist" })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashPassword
        })

        //producer
        await emailQueue.add("welcome-email", {
            email: user.email,
            name: user.name,
            to: email,
            subject: "Welcome",
            message: "Welcome to our application"
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

        emailQueue.add("daily-report",{},{
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
    } catch (error) {
        console.log("signup error", error)
        return res.status(500).json({ messsage: "signup error", error })
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log(req.body)

        if (!email || !password) {
            return res.status(400).json({ message: "all filed are required" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password,)
        if (!isMatch) {
            return res.status(400).json({ message: "password not match" })
        }
        const { AccessToken, RefreshToken } = genToken(user)

        // producet
        // await loginQueue.add("login-alert", {
        //     email: user.email,
        //     ip: req.ip,
        // });
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