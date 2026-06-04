const roomsStrokes = {};
const roomsUsers = {};
export const addUserToRoom = (roomId, socketId, name) => {
  if (!roomsUsers[roomId]) {
    roomsUsers[roomId] = [];
  }
  if (!roomsUsers[roomId].some((u) => u.id === socketId)) {
    roomsUsers[roomId].push({ id: socketId, name });
  }
};
export const removeUserFromRoom = (roomId, socketId) => {
  if (roomsUsers[roomId]) {
    roomsUsers[roomId] = roomsUsers[roomId].filter((u) => u.id !== socketId);
    if (roomsUsers[roomId].length === 0) {
      delete roomsUsers[roomId];
    }
  }
};
export const getRoomUsers = (roomId) => {
  return roomsUsers[roomId] || [];
};

export const addStrokeToRoom = (roomId, stroke) => {
  if (!roomsStrokes[roomId]) {
    roomsStrokes[roomId] = [];
  }
  roomsStrokes[roomId].push(stroke);
};

export const getRoomStrokes = (roomId) => {
  return roomsStrokes[roomId] || [];
};
export const clearRoomStrokes = (roomId) => {
  roomsStrokes[roomId] = [];
};
