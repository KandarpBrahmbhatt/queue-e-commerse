import { Request, Response } from "express";
import { askAI } from "../services/ai.services";

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const reply = await askAI(message);

        return res.status(200).json({
            success: true,
            reply,
        });

    } catch (error) {
        console.log("AI error:", error);
        return res.status(500).json({
            success: false,
            message: "AI service error",
        });
    }
};