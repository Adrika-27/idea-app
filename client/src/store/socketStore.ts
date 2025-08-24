import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';
import { queryClient } from '@/main';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, { userId: string; username: string }>;
  
  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  joinIdea: (ideaId: string) => void;
  leaveIdea: (ideaId: string) => void;
  emitTyping: (ideaId: string) => void;
  emitStopTyping: (ideaId: string) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addTypingUser: (ideaId: string, userId: string, username: string) => void;
  removeTypingUser: (ideaId: string, userId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),

  connect: (token: string) => {
    const socketUrl = (import.meta as any).env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('user:online', ({ userId }: SocketEvents['user:online']) => {
      get().addOnlineUser(userId);
    });

    socket.on('user:offline', ({ userId }: SocketEvents['user:offline']) => {
      get().removeOnlineUser(userId);
    });

    socket.on('user:typing', ({ userId, username, ideaId }: SocketEvents['user:typing']) => {
      get().addTypingUser(ideaId, userId, username);
    });

    socket.on('user:stopped_typing', ({ userId, ideaId }: SocketEvents['user:stopped_typing']) => {
      get().removeTypingUser(ideaId, userId);
    });

    // Real-time data updates
    socket.on('vote:updated', ({ ideaId, voteScore, userVote }: SocketEvents['vote:updated']) => {
      console.log('Idea vote updated:', { ideaId, voteScore, userVote });
      // Invalidate queries for the specific idea to update its details
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      // Invalidate queries for lists of ideas to update vote counts there
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    });

    socket.on('comment:added', ({ comment }: SocketEvents['comment:added']) => {
      console.log('New comment received:', comment);
      queryClient.invalidateQueries({ queryKey: ['comments', comment.ideaId] });
    });

    socket.on('idea:new', ({ idea }: SocketEvents['idea:new']) => {
      console.log('New idea received:', idea);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    });

    socket.on('comment:vote_updated', ({ ideaId, commentId, voteScore }: SocketEvents['comment:vote_updated']) => {
      console.log('Comment vote updated:', { ideaId, commentId, voteScore });
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false,
        onlineUsers: new Set(),
        typingUsers: new Map(),
      });
    }
  },

  joinIdea: (ideaId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join:idea', ideaId);
    }
  },

  leaveIdea: (ideaId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave:idea', ideaId);
    }
  },

  emitTyping: (ideaId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:start', { ideaId });
    }
  },

  emitStopTyping: (ideaId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:stop', { ideaId });
    }
  },

  addOnlineUser: (userId: string) => {
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    }));
  },

  removeOnlineUser: (userId: string) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    });
  },

  addTypingUser: (ideaId: string, userId: string, username: string) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(`${ideaId}:${userId}`, { userId, username });
      return { typingUsers: newTypingUsers };
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeTypingUser(ideaId, userId);
    }, 3000);
  },

  removeTypingUser: (ideaId: string, userId: string) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.delete(`${ideaId}:${userId}`);
      return { typingUsers: newTypingUsers };
    });
  },
}));
