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

// Calculates when the Gemini free-tier quota resets (midnight US/Pacific)
// and returns a friendly message with the exact time in IST (UTC+5:30)
const getQuotaExhaustedMessage = (errorMsg = '') => {
  try {
    // Try to extract retryDelay seconds from the Gemini error response (per-minute quota)
    const retryMatch = errorMsg.match(/"retryDelay":"(\d+)s"/);
    const retrySeconds = retryMatch ? parseInt(retryMatch[1], 10) : null;

    // Gemini free tier daily quota resets at midnight US/Pacific Time (UTC-7 in PDT, UTC-8 in PST)
    const now = new Date();

    // Determine current Pacific offset (PDT = UTC-7, PST = UTC-8)
    // We approximate: PDT is Mar 2nd Sun → Nov 1st Sun; PST otherwise
    const month = now.getUTCMonth(); // 0-indexed
    const pacificOffsetHours = (month >= 2 && month <= 9) ? -7 : -8;

    // Next midnight Pacific
    const nowPacificMs = now.getTime() + pacificOffsetHours * 3600 * 1000;
    const nowPacific = new Date(nowPacificMs);
    const nextMidnightPacific = new Date(nowPacific);
    nextMidnightPacific.setUTCHours(24 - pacificOffsetHours, 0, 0, 0); // midnight Pacific in UTC

    // Convert to IST (UTC+5:30)
    const nextMidnightIST = new Date(nextMidnightPacific.getTime() + (5.5 * 3600 * 1000));
    const istTime = nextMidnightIST.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Time remaining
    const msLeft = nextMidnightPacific.getTime() - now.getTime();
    const hoursLeft = Math.floor(msLeft / 3600000);
    const minutesLeft = Math.floor((msLeft % 3600000) / 60000);
    const timeLeftStr = hoursLeft > 0
      ? `${hoursLeft}h ${minutesLeft}m`
      : `${minutesLeft} minutes`;

    const isDailyQuota = errorMsg.includes('exceeded your current quota') || errorMsg.includes('free_tier_requests');

    // Per-minute rate limit (short wait) vs daily quota (long wait)
    // Only show the short wait message if it's explicitly NOT a daily quota error
    if (retrySeconds && retrySeconds < 120 && !isDailyQuota) {
      const waitSec = retrySeconds + 5;
      return `⏳ **Rate limit reached** — too many requests in a short time.\n\nPlease wait **${waitSec} seconds** and try again. The AI will be ready shortly!`;
    }

    return `📊 **Daily AI quota reached**

The free Gemini AI quota is currently exhausted for the day.

⏰ **Quota renews at:** ${istTime} IST
⌛ **Time remaining:** ~${timeLeftStr}

Until then, you can:
- Browse uploaded notes in the **Notes Repository**
- Post questions in the **Doubt Forum** for peer help
- Use the **Collaborative Whiteboard** for study sessions

The AI will be fully available again after renewal! 🚀`;
  } catch (_) {
    return `📊 **Daily AI quota reached**\n\nThe free Gemini AI quota is currently exhausted for the day.\n\nIt resets every day at approximately **1:30 PM IST**.\n\nPlease try again after the reset. In the meantime, use the Notes Repository or Doubt Forum!`;
  }
};

export const generateResponse = async (userMessage, noteContext = null, history = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return 'AI assistant is not configured yet. Please add the GEMINI_API_KEY environment variable.';
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build Gemini history from past turns (exclude the current message — it's sent via sendMessage).
    // Gemini requires strict alternating user → model pairs.
    // Skip index 0 (the initial bot greeting with no preceding user message).
    const pastMessages = history.slice(0, -1); // exclude the last message (current user msg)
    const geminiHistory = [];
    for (let i = 1; i < pastMessages.length - 1; i += 2) {
      const userMsg = pastMessages[i];
      const botMsg = pastMessages[i + 1];
      if (userMsg && userMsg.sender === 'user' && botMsg && botMsg.sender === 'bot') {
        geminiHistory.push({ role: 'user', parts: [{ text: userMsg.text }] });
        geminiHistory.push({ role: 'model', parts: [{ text: botMsg.text }] });
      }
    }

    const chat = model.startChat({ history: geminiHistory });

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
      return getQuotaExhaustedMessage(err.message);
    }
    return '⚠️ I encountered an issue reaching the AI service. Please try again shortly.';
  }
};
