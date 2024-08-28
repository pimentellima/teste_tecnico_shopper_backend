import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs";

export default async function getImageMeasureFromGemini(path: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "Read the measurement in the photo and respond with a text containing the measurement value you read. Example of response: 000010",
    {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
  ]);

  return result.response.text().trim();
}
