import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askGemini = async (message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Extract property requirements from this message and return JSON:
  {
    location: "",
    budget: "",
    type: ""
  }

  Message: ${message}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
};
