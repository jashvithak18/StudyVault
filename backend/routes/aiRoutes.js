import exp from 'express';
import { NoteModel } from '../models/Note.js';
import { generateResponse } from '../services/chatbotService.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
export const aiRoutes = exp.Router();

// context-aware chat based on uploaded note (supports conversation history)
aiRoutes.post('/chat-with-note', verifyToken, async (req, res, next) => {
  try {
    const { message, noteId, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let noteContext = null;
    if (noteId) {
      noteContext = await NoteModel.findById(noteId);
    }

    const reply = await generateResponse(message, noteContext, history || []);
    res.status(200).json({ message: 'Chat response', reply });
  } catch (err) {
    next(err);
  }
});

// general chat without note context
aiRoutes.post('/chat', verifyToken, async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const reply = await generateResponse(message, null, history || []);
    res.status(200).json({ message: 'Chat response', reply });
  } catch (err) {
    next(err);
  }
});

export default aiRoutes;
