import exp from 'express';
import { QuestionModel } from '../models/Question.js';
import { AnswerModel } from '../models/Answer.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
export const doubtRoute = exp.Router();
// fetch all questions for doubt 
doubtRoute.get('/questions', verifyToken, async (req, res, next) => {
  try {
    const questions = await QuestionModel.find()
      .populate('user', 'firstName lastName')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Questions retrieved", payload: questions });
  } catch (err) {
    next(err);
  }
});
// post a new doubt question
doubtRoute.post('/questions', verifyToken, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const newQuestion = new QuestionModel({
      title,
      content,
      user: req.user.id
    });
    const savedQuestion = await newQuestion.save();
    const populated = await QuestionModel.findById(savedQuestion._id).populate('user', 'firstName lastName');
    res.status(201).json({ message: "Question created", payload: populated });
  } catch (err) {
    next(err);
  }
});
// add comment to a question
doubtRoute.put('/questions/:id/comments', verifyToken, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const questionId = req.params.id;
    
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    question.comments.push({ content: comment, user: req.user.id });
    await question.save();
    res.status(200).json({ message: "Comment added", payload: question });
  } catch (err) {
    next(err);
  }
});
// get all answers for a  question
doubtRoute.get('/questions/:id/answers', verifyToken, async (req, res, next) => {
  try {
    const answers = await AnswerModel.find({ question: req.params.id })
      .populate('user', 'firstName lastName')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: 1 });
    res.status(200).json({ message: "Answers retrieved", payload: answers });
  } catch (err) {
    next(err);
  }
});
// detailed answer to a question
doubtRoute.post('/questions/:id/answers', verifyToken, async (req, res, next) => {
  try {
    const { content } = req.body;
    const questionId = req.params.id;
    const questionExists = await QuestionModel.findById(questionId);
    if (!questionExists) {
      return res.status(404).json({ message: "Question not found" });
    }
    const newAnswer = new AnswerModel({
      content,
      question: questionId,
      user: req.user.id
    });
       const savedAnswer = await newAnswer.save();
    const populated = await AnswerModel.findById(savedAnswer._id).populate('user', 'firstName lastName');
    res.status(201).json({ message: "Answer created", payload: populated });
  } catch (err) {
    next(err);
  }
});
export default doubtRoute;
