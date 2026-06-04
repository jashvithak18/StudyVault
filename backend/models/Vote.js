import { Schema, model } from 'mongoose'
const voteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
})

export const VoteModel = model("vote", voteSchema)
