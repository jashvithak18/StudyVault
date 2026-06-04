import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are StudyVault AI, a professional academic assistant built into the StudyVault platform — a collaborative study application for college and university students.

Your capabilities:
- Answer academic questions clearly and concisely across all subjects (Math, Physics, CS, Chemistry, Literature, Engineering, etc.)
- Summarize study documents and lecture notes
- Explain complex concepts in simple, student-friendly terms
- Generate practice questions and exam-style problems
- Help students understand and debug code
- Provide step-by-step solutions with clear working

Your personality:
- Friendly, encouraging, and patient
- Precise and factual — never make up information
- Format responses using clear structure: numbered steps, bullet points, code blocks when needed
- Keep responses focused, accurate, and academic in tone
- Use markdown formatting for better readability`;

export const generateResponse = async (userMessage, noteContext = null, history = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return 'AI assistant is not configured yet. Please add the GEMINI_API_KEY environment variable.';
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert history array [{sender, text}] to Gemini format [{role, parts}]
    const geminiHistory = history
      .filter(m => m.sender !== 'bot' || history.indexOf(m) > 0) // skip the initial greeting
      .map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

    const chat = model.startChat({
      history: geminiHistory,
    });

    let prompt = userMessage;

    // If a note is selected, prepend document context only if history is fresh
    if (noteContext && history.length <= 1) {
      prompt = `I am studying a document called "${noteContext.title}" (Subject: ${noteContext.subject || 'General'}).
${noteContext.description ? `Description: ${noteContext.description}` : ''}
${noteContext.aiSummary ? `Summary context: ${noteContext.aiSummary}` : ''}

My question about this document: ${userMessage}`;
    }

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      return '⚠️ The Gemini API key is invalid. Please check your environment configuration.';
    }
    if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return '⚠️ The AI service is temporarily rate-limited. Please wait a moment and try again.';
    }
    return '⚠️ I encountered an issue reaching the AI service. Please try again shortly.';
  }
};
