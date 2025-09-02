import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = useAuthStore.getState().tokens?.accessToken;
    
    if (!token || this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  // Idea room management
  joinIdeaRoom(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join:idea', ideaId);
    }
  }

  leaveIdeaRoom(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave:idea', ideaId);
    }
  }

  // Comment events
  onCommentAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment:added', callback);
    }
  }

  onCommentVoteUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment:vote_updated', callback);
    }
  }

  offCommentAdded(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('comment:added', callback);
    }
  }

  offCommentVoteUpdated(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('comment:vote_updated', callback);
    }
  }

  // Vote events
  onVoteUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('vote:updated', callback);
    }
  }

  offVoteUpdated(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('vote:updated', callback);
    }
  }

  // Typing indicators
  startTyping(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { ideaId });
    }
  }

  stopTyping(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { ideaId });
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:stopped_typing', callback);
    }
  }

  offUserTyping(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user:typing', callback);
    }
  }

  offUserStoppedTyping(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user:stopped_typing', callback);
    }
  }

  // Notification events
  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  offNotification(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('notification:new', callback);
    }
  }

  // User presence
  onUserOnline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  }

  onUserOffline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  }

  offUserOnline(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user:online', callback);
    }
  }

  offUserOffline(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user:offline', callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
