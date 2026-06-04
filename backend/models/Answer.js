import { Schema, model } from 'mongoose'
const answerCommentSchema = new Schema({
  content: {
    type: String,
    required: [true, "Comment content is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
})
const answerSchema = new Schema({
  content: {
    type: String,
    required: [true, "Answer content is required"]
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'question',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  comments: [answerCommentSchema]
}, {
  versionKey: false,
  timestamps: true
})

export const AnswerModel = model("answer", answerSchema)
