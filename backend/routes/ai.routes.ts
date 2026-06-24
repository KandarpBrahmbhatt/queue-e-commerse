import express from "express";
import { chatWithAI } from "../controller/ai.controller";

const aiRoutes = express.Router();

aiRoutes.post("/chat", chatWithAI);

export default aiRoutes;