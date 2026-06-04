import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSummary = async (noteTitle, description) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Summary for "${noteTitle}": ${description || 'No description provided.'}`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an academic assistant. Generate a concise, well-structured study summary for a document with the following details:

Title: "${noteTitle}"
Description: "${description || 'No description provided'}"

Your summary should:
1. Identify the likely topic and subject area
2. List the key concepts a student should focus on
3. Suggest 2-3 study tips relevant to this topic
4. Be formatted clearly with sections

Keep it under 250 words. Be accurate and helpful for a college student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini summary error:', err.message);
    return `Summary for "${noteTitle}": ${description || 'This document covers key academic concepts. Upload and review carefully.'}`;
  }
};
