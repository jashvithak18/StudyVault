import exp from 'express';
import { NoteModel } from '../models/Note.js';
import { generateResponse } from '../services/chatbotService.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
export const aiRoutes = exp.Router();
//ask-vault chatbot interaction
aiRoutes.post('/chat', verifyToken, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    const reply = await generateResponse(message);
    res.status(200).json({ message: "Chat response", payload: { reply } });
  } catch (err) {
    next(err);
  }
});
// context-aware chat based on uploaded note
aiRoutes.post('/chat-with-note', verifyToken, async (req, res, next) => {
  try {
    const { message, noteId } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    let noteContext = null;
    if (noteId) {
      noteContext = await NoteModel.findById(noteId);
    }
    const reply = await generateResponse(message, noteContext);
    res.status(200).json({ message: "Chat response", payload: { reply } });
  } catch (err) {
    next(err);
  }
});

export default aiRoutes;
