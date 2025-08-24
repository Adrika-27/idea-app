import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket';

export const useSocket = () => {
  const { user, tokens } = useAuthStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (user && tokens?.accessToken && !isInitialized.current) {
      socketService.connect();
      isInitialized.current = true;
    }

    return () => {
      if (!user || !tokens?.accessToken) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, [user, tokens?.accessToken]);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isConnected(),
    joinIdeaRoom: socketService.joinIdeaRoom.bind(socketService),
    leaveIdeaRoom: socketService.leaveIdeaRoom.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService)
  };
};

export const useIdeaSocket = (ideaId: string) => {
  const { joinIdeaRoom, leaveIdeaRoom } = useSocket();

  useEffect(() => {
    if (ideaId) {
      joinIdeaRoom(ideaId);
      return () => leaveIdeaRoom(ideaId);
    }
  }, [ideaId, joinIdeaRoom, leaveIdeaRoom]);

  return socketService;
};
