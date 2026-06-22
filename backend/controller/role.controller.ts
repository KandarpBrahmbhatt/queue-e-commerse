import { Request,Response } from "express"

export const createRole = (req: Request, res: Response) => {
    try {
        const { name } = req.body
        if (!name) {
            return res.status(400).json({ message: "role not found" })
        }
    } catch (error) {
        console.log(`create ROle error ${error}`)
    }
}