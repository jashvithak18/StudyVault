import { Schema, model } from 'mongoose'
const noteSchema = new Schema({
  title: {
    type: String,
    required: [true, "Note title is required"]
  },
  description: {
    type: String,
    default: ''
  },
  topic: {
    type: String,
    required: [true, "Topic category is required (e.g. notes, pdfs, past-papers)"],
    enum: ['notes', 'pdfs', 'past-papers']
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  aiSummary: {
    type: String,
    default: ''
  }
}, {
  versionKey: false,
  timestamps: true
})

export const NoteModel = model("note", noteSchema)
