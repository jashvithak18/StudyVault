import exp from 'express';
import { NoteModel } from '../models/Note.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { generateSummary } from '../services/summaryService.js';
import upload from '../middlewares/uploadMiddleware.js';
import axios from 'axios';
import path from 'path';
export const notesRoutes = exp.Router();
// upload a new study note
notesRoutes.post('/upload', verifyToken, upload.single('note'), async (req, res, next) => {
  try {
    const { title, description, topic, subject, semester } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }
    const aiSummary = await generateSummary(title, description);
    const newNote = new NoteModel({
      title,
      description,
      topic,
      subject: subject || 'General',
      semester: semester || 'Semester 1',
      filename: req.file.originalname || req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      user: req.user.id,
      aiSummary
    }); 
    const result = await newNote.save();
    res.status(201).json({ message: "Note uploaded successfully", payload: result });
  } catch (err) {
    next(err);
  }
});

// fetch all uploaded notes for the dashboard
notesRoutes.get('/', verifyToken, async (req, res, next) => {
  try {
    const notesList = await NoteModel.find().populate('user', 'firstName lastName');
    res.status(200).json({ message: "Notes retrieved", payload: notesList });
  } catch (err) {
    next(err);
  }
});

// handle upvoting or downvoting a  note
notesRoutes.post('/:id/vote', verifyToken, async (req, res, next) => {
  try {
    const { type } = req.body;
    const noteId = req.params.id;
    const userId = req.user.id;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    note.upvotes = note.upvotes.filter(id => id.toString() !== userId);
    note.downvotes = note.downvotes.filter(id => id.toString() !== userId);
    if (type === 'upvote') {
      note.upvotes.push(userId);
    } else if (type === 'downvote') {
      note.downvotes.push(userId);
    }
    await note.save();
    res.status(200).json({ message: `Note ${type}d successfully`, payload: note });
  } catch (err) {
    next(err);
  }
});

// download the actual file associated with a note
notesRoutes.get('/download/:id', async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    // If the file is stored remotely, stream it to preserve headers and original name
    if (note.filepath.startsWith('http')) {
      const response = await axios({
        method: 'get',
        url: note.filepath,
        responseType: 'stream'
      });
      
      const filename = note.filename || `note-${note._id}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', note.mimeType || 'application/octet-stream');
      
      response.data.pipe(res);
    } else {
      res.download(note.filepath, note.filename);
    }
  } catch (err) {
    next(err);
  }
});

// view the note inline in the browser (handles PDFs, text files, and images)
notesRoutes.get('/view/:id', async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    // Determine the content type and filename
    const filename = note.filename || `note-${note._id}.pdf`;
    const ext = filename.split('.').pop().toLowerCase();
    
    let mimeType = note.mimeType || 'application/pdf';
    if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (ext === 'txt') {
      mimeType = 'text/plain';
    } else if (ext === 'png') {
      mimeType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      mimeType = 'image/jpeg';
    }

    if (note.filepath.startsWith('http')) {
      const response = await axios({
        method: 'get',
        url: note.filepath,
        responseType: 'stream'
      });
      
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', mimeType);
      
      response.data.pipe(res);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', mimeType);
      res.sendFile(path.resolve(note.filepath));
    }
  } catch (err) {
    next(err);
  }
});

// retrieve the AI generated summary for a note
notesRoutes.get('/summary/:id', verifyToken, async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    if (!note.aiSummary) {
      note.aiSummary = await generateSummary(note.title, note.description);
      await note.save();
    }
    res.status(200).json({ message: "Summary retrieved", payload: note.aiSummary });
  } catch (err) {
    next(err);
  }
});

export default notesRoutes;
