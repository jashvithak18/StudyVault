import Groq from 'groq-sdk';
import { config } from 'dotenv';
config();

// Initialize Groq using the existing API key environment variable so Render settings don't need to change
const groq = process.env.GEMINI_API_KEY ? new Groq({ apiKey: process.env.GEMINI_API_KEY }) : null;

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

export const generateResponse = async (userMessage, noteContext = null, history = [], attachment = null) => {
  try {
    if (!groq) {
      return 'AI assistant is not configured yet. Please add your API key to the environment variables.';
    }

    let activeModel = 'llama-3.3-70b-versatile'; // Default text model

    // Build history for Groq (OpenAI-style: { role: 'system'|'user'|'assistant', content: '...' })
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Build Groq history from past turns (exclude the current message — it's sent at the end).
    // Skip index 0 (the initial bot greeting).
    const pastMessages = history.slice(0, -1);
    for (let i = 1; i < pastMessages.length; i++) {
      const msg = pastMessages[i];
      messages.push({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      });
    }

    let promptContent = userMessage;

    // If a repository note is selected, prepend its metadata
    if (noteContext && history.length <= 1) {
      promptContent = `I am studying a document called "${noteContext.title}" (Subject: ${noteContext.subject || 'General'}).
${noteContext.description ? `Description: ${noteContext.description}` : ''}
${noteContext.aiSummary ? `Document Summary: ${noteContext.aiSummary}` : '(Note: The full document text is not available right now, so please answer based on your general knowledge of this topic and the document title.)'}

My question about this topic: ${userMessage}`;
    }

    // Handle temporary file attachment
    let userMessageObject = { role: 'user', content: promptContent };

    if (attachment) {
      if (attachment.type === 'pdf' || attachment.type === 'text') {
        promptContent = `Below is the text of a document I attached. Please answer my question based on it.
        
--- DOCUMENT CONTENT ---
${attachment.text}
--- END OF DOCUMENT ---

My question: ${userMessage}`;
        userMessageObject = { role: 'user', content: promptContent };
      } else if (attachment.type === 'image') {
        // Switch to vision model
        activeModel = 'llama-3.2-90b-vision-preview';
        userMessageObject = {
          role: 'user',
          content: [
            { type: 'text', text: userMessage || 'Analyze this image.' },
            { type: 'image_url', image_url: { url: attachment.url } }
          ]
        };
      }
    }

    // Add the current user message
    messages.push(userMessageObject);

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: activeModel,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'No response received.';
  } catch (err) {
    console.error('Groq API error:', err.message);
    if (err.message?.includes('invalid API key') || err.message?.includes('auth')) {
      return '⚠️ The API key is invalid. Please check your environment configuration.';
    }
    if (err.message?.includes('rate limit') || err.status === 429) {
      return '⏳ **Rate limit reached** — too many requests in a short time.\n\nPlease wait a moment and try again.';
    }
    return '⚠️ I encountered an issue reaching the AI service. Please try again shortly.';
  }
};
