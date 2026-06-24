import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const askAI = async (message: string) => {
    try {
        const response = await groq.chat.completions.create({
           model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful e-commerce store assistant.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.log("AI ERROR:", error);

        return "AI service unavailable";
    }
};