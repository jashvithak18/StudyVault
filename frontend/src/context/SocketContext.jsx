import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuth } from './AuthContext';
const SocketContext = createContext(null);
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }
    const socketInstance = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
