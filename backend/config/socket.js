import { Server } from 'socket.io'
import { addUserToRoom, removeUserFromRoom, getRoomUsers, addStrokeToRoom, getRoomStrokes, clearRoomStrokes } from '../services/whiteboardService.js'
let io
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`)
    socket.on('room:join', ({ roomId, user }) => {
      socket.join(roomId)
      socket.user = user
      socket.roomId = roomId
      addUserToRoom(roomId, socket.id, user.name)
      io.to(roomId).emit('room:users', getRoomUsers(roomId))
      // Replay draw history for new joiner
      const history = getRoomStrokes(roomId)
      history.forEach((stroke) => socket.emit('stroke', stroke))
    })
    socket.on('draw', (strokeData) => {
      const { roomId } = strokeData
      addStrokeToRoom(roomId, strokeData)
      socket.to(roomId).emit('stroke', strokeData)
    })
    socket.on('clear', ({ roomId }) => {
      clearRoomStrokes(roomId)
      socket.to(roomId).emit('clear-board')
    })
    socket.on('disconnect', () => {
      if (socket.roomId) {
        removeUserFromRoom(socket.roomId, socket.id)
        io.to(socket.roomId).emit('room:users', getRoomUsers(socket.roomId))
      }
      console.log(`Socket Disconnected: ${socket.id}`)
    })
  })
  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}
