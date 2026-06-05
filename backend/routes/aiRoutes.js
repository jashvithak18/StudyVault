import exp from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { NoteModel } from '../models/Note.js';
import { generateResponse } from '../services/chatbotService.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

export const aiRoutes = exp.Router();

// Memory storage for temporary AI attachments
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// context-aware chat based on uploaded note (supports conversation history)
// keeping this intact for backwards compatibility if needed
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

    const reply = await generateResponse(message, noteContext, history || [], null);
    res.status(200).json({ message: 'Chat response', reply });
  } catch (err) {
    next(err);
  }
});

// general chat with optional file attachment
aiRoutes.post('/chat', verifyToken, uploadMemory.single('file'), async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    // Check for message text OR file (we need at least one)
    if (!message && !req.file) {
      return res.status(400).json({ message: 'Message or file is required' });
    }

    let parsedHistory = [];
    if (history) {
      try {
        parsedHistory = typeof history === 'string' ? JSON.parse(history) : history;
      } catch (e) {
        parsedHistory = [];
      }
    }

    let attachment = null;

    if (req.file) {
      const mimeType = req.file.mimetype;
      if (mimeType === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        attachment = { type: 'pdf', text: pdfData.text };
      } else if (mimeType.startsWith('image/')) {
        const base64Img = req.file.buffer.toString('base64');
        attachment = { type: 'image', url: `data:${mimeType};base64,${base64Img}` };
      } else if (mimeType === 'text/plain') {
        attachment = { type: 'text', text: req.file.buffer.toString('utf-8') };
      } else {
        return res.status(400).json({ message: 'Unsupported file type. Please upload a PDF, TXT, or Image.' });
      }
    }

    const reply = await generateResponse(message || "Analyze this file.", null, parsedHistory, attachment);
    res.status(200).json({ message: 'Chat response', reply });
  } catch (err) {
    next(err);
  }
});

export default aiRoutes;
