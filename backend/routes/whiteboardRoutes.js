import exp from 'express';
import { getRoomUsers } from '../services/whiteboardService.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
export const whiteboardRoutes = exp.Router();
// fetch all active users currently collaborating in a specific whiteboard room
whiteboardRoutes.get('/room/:roomId/users', verifyToken, async (req, res, next) => {
  try {
    const users = getRoomUsers(req.params.roomId);
    res.status(200).json({ message: "Room users retrieved", payload: users });
  } catch (err) {
    next(err);
  }
});

export default whiteboardRoutes;
