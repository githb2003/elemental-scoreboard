
// A simple WebSocket service for real-time updates

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionPromise: Promise<boolean> | null = null;
  private connectionResolve: ((value: boolean) => void) | null = null;
  
  connect() {
    // If already connecting, return the existing promise
    if (this.connectionPromise && this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      return this.connectionPromise;
    }
    
    // Create a new connection promise
    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolve = resolve;
      
      // Use secure WebSocket if on HTTPS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      try {
        // Close any existing connection
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
        
        this.socket = new WebSocket(`${protocol}//${host}/ws`);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Notify all listeners of connection established
          this.notifyListeners('connection', { status: 'connected' });
          
          if (this.connectionResolve) {
            this.connectionResolve(true);
            this.connectionResolve = null;
          }
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type) {
              this.notifyListeners(data.type, data.payload);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket connection closed');
          
          // Notify listeners of disconnection
          this.notifyListeners('connection', { status: 'disconnected' });
          
          if (this.connectionResolve) {
            this.connectionResolve(false);
            this.connectionResolve = null;
          }
          
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Socket will automatically close after error
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        
        if (this.connectionResolve) {
          this.connectionResolve(false);
          this.connectionResolve = null;
        }
        
        this.attemptReconnect();
      }
    });
    
    return this.connectionPromise;
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * this.reconnectAttempts, 5000);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }
  
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  sendMessage(type: string, payload: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }
  
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)?.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  private notifyListeners(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket listener for event '${eventType}':`, error);
      }
    });
  }
  
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
