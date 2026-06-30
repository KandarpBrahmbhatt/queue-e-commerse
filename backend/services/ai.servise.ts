import { OpenAI } from "openai";
import { buildPrompt } from "./ai.prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const aiService = async (message: string,userId: string) => {
  const prompt = buildPrompt(message);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an e-commerce support assistant.",
      },
      {
        role: "user",
        content: prompt,    
      },
    ],
  });

  return response.choices[0].message.content;
};