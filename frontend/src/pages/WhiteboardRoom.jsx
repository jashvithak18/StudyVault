import React, { useState, useEffect } from 'react';
import Whiteboard from '../components/Whiteboard';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Users, Info, Plus } from 'lucide-react';
const WhiteboardRoom = () => {
  const [roomId, setRoomId] = useState('global');
  const [inRoom, setInRoom] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  useEffect(() => {
    if (!socket || !inRoom) return;

    socket.emit('room:join', { roomId, user: { name: user.name } });

    const handleRoomUsers = (users) => {
      setUsersList(users);
    };
    socket.on('room:users', handleRoomUsers);
    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:users', handleRoomUsers);
    };
  }, [socket, inRoom, roomId]);
  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      setInRoom(true);
    }
  };

  return (
    <div className="whiteboard-room-page page-container">
      <div className="page-header">
        <h1>Collaborative Whiteboard</h1>
        <p className="subtitle">Brainstorm and co-sketch formulas, graphs, or code blocks in real-time with your classmates.</p>
      </div>

      {!inRoom ? (
        <div className="room-join-container glassmorphic-panel">
          <h2>Join/Create a Drawing Room</h2>
          <p>Enter a unique room code to invite peers, or keep it "global" to collaborate in the public workspace.</p>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="room-input">Room Code</label>
              <input
                id="room-input"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="e.g. chemistry-review"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              <Plus size={16} /> Enter Room
            </button>
          </form>
        </div>
      ) : (
        <div className="active-room-layout">
          <div className="board-main-area glassmorphic-panel">
            <div className="board-header">
              <h2>Room: <span className="room-badge">{roomId}</span></h2>
              <button className="btn btn-danger btn-sm" onClick={() => setInRoom(false)}>
                Leave Room
              </button>
            </div>
            <Whiteboard roomId={roomId} />
          </div>

          <div className="board-sidebar-area glassmorphic-panel">
            <h3>
              <Users size={18} /> Collaborators ({usersList.length})
            </h3>
            <ul className="collaborators-list">
              {usersList.map((usr, i) => (
                <li key={i} className="collaborator-item">
                  <div className="avatar-dot"></div>
                  <span>{usr.name} {usr.name === user.name && '(You)'}</span>
                </li>
              ))}
            </ul>
            <div className="room-info-card">
              <Info size={16} />
              <p>Share the room code <strong>"{roomId}"</strong> with your friends to draw together.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteboardRoom;
