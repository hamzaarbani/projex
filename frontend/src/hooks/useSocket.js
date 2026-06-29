import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (workspaceId, userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    socketRef.current.emit('join-workspace', workspaceId);
    if (userId) {
      socketRef.current.emit('join-user', userId);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [workspaceId, userId]);

  return socketRef.current;
};