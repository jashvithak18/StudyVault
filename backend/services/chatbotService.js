import { searchInNote } from './semanticSearchService.js';
export const generateResponse = async (userMessage, noteContext = null) => {
  if (!userMessage) return 'How can I assist you in your studies today?';
  if (noteContext) {
    const matchedExtract = await searchInNote(noteContext, userMessage);
    return `Based on your note "${noteContext.title}", here is what I found:\n\n"${matchedExtract}"\n\nIs there anything else in this document you would like to clarify?`;
  }
  const msg = userMessage.toLowerCase();
  if (/\b(hello|hi|hey)\b/i.test(msg)) {
    return 'Hello! I am your StudyVault AI assistant. I can summarize notes, search uploaded materials, or answer general conceptual questions. What are we studying today?';
  }
  if (msg.includes('whiteboard')) {
    return 'StudyVault includes a Collaborative Whiteboard! You can enter a room code from the "Whiteboard" menu option and start sketching in real-time with classmates.';
  }
  if (msg.includes('forum') || msg.includes('doubt')) {
    return 'If you have difficult homework queries, post them in our "Doubt Forum" where peer students can review, vote, and offer markdown solutions.';
  }
  if (msg.includes('help') || msg.includes('how to')) {
    return 'To get started: 1) Go to "Upload Notes" to save study PDFs, 2) Visit "AskVault AI" to ask questions about your uploads, 3) Open the "Whiteboard" to sketch collaboratively.';
  }
  return `Interesting query! StudyVault AI is tracking your question: "${userMessage}". While in development sandbox, I suggest uploading a study PDF to ask specific document queries. Let me know if I can help you with anything else!`;
};
