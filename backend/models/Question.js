import { Schema, model } from 'mongoose'
const commentSchema = new Schema({
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
const questionSchema = new Schema({
  title: {
    type: String,
    required: [true, "Question title is required"]
  },
  content: {
    type: String,
    required: [true, "Question content is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  comments: [commentSchema]
}, {
  versionKey: false,
  timestamps: true
})

export const QuestionModel = model("question", questionSchema)
