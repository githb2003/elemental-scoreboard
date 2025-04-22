// A simple WebSocket service for real-time updates

// Utilisons BroadcastChannel pour la communication entre onglets
const broadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel('elemental-scores') : null;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionPromise: Promise<boolean> | null = null;
  private connectionResolve: ((value: boolean) => void) | null = null;
  private useLocalSync: boolean = true; // Utiliser la synchronisation locale par défaut
  
  constructor() {
    // Écouter les messages d'autres onglets
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'scoreUpdate') {
          this.notifyListeners('scoreUpdate', event.data.payload);
        }
      };
    }
  }
  
  connect(options: { silent?: boolean } = {}) {
    const { silent = false } = options;
    // Si déjà en train de se connecter, renvoyer la promesse existante
    if (this.connectionPromise && this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      return this.connectionPromise;
    }
    
    // Reset reconnect attempts when manually connecting
    this.reconnectAttempts = 0;
    
    // Créer une nouvelle promesse de connexion
    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolve = resolve;
      
      // Fallback to local sync immediately to ensure functionality
      this.useLocalSync = true;
      
      if (!silent) {
        console.log('WebSocket connection attempt...');
      }
      
      // Try WebSocket connection
      this.connectWebSocket(silent)
        .then(success => {
          if (success) {
            this.useLocalSync = false;
            if (!silent) {
              console.log('WebSocket connection established');
            }
          } else {
            if (!silent) {
              console.log('WebSocket connection failed, using local sync only');
            }
          }
          if (this.connectionResolve) {
            this.connectionResolve(true);
            this.connectionResolve = null;
          }
        });
    });
    
    return this.connectionPromise;
  }
  
  private connectWebSocket(silent: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Fermer toute connexion existante
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        
        // In development, use a direct WebSocket URL that matches the current page protocol
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // Determine WebSocket URL based on environment
        let wsUrl: string;
        if (isLocalhost) {
          // For local development
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
          wsUrl = `${protocol}//${window.location.hostname}:${port}/ws`;
        } else {
          // For production/staging
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.host;
          wsUrl = `${protocol}//${host}/ws`;
        }
        
        if (!silent) {
          console.log(`Attempting WebSocket connection to ${wsUrl}`);
        }
        
        this.socket = new WebSocket(wsUrl);
        
        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          if (!silent) {
            console.log('WebSocket connection timeout');
          }
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            this.socket.close();
            resolve(false);
          }
        }, 5000);
        
        this.socket.onopen = () => {
          if (!silent) {
            console.log('WebSocket connected successfully');
          }
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          
          // Notifier tous les écouteurs de la connexion établie
          this.notifyListeners('connection', { status: 'connected' });
          resolve(true);
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
          if (!silent) {
            console.log('WebSocket connection closed');
          }
          clearTimeout(connectionTimeout);
          
          // Notifier les écouteurs de la déconnexion
          this.notifyListeners('connection', { status: 'disconnected' });
          
          this.attemptReconnect(silent);
          resolve(false);
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(connectionTimeout);
          // Socket will automatically close after error
          resolve(false);
        };
        
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        resolve(false);
      }
    });
  }
  
  private attemptReconnect(silent: boolean) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.useLocalSync = true;
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * this.reconnectAttempts, 5000);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      if (!silent) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }
      this.connectWebSocket(silent);
    }, delay);
  }
  
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  sendMessage(type: string, payload: any) {
    // Always broadcast to other tabs via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload });
    }
    
    // Notifier les écouteurs locaux
    this.notifyListeners(type, payload);
    
    // Try to send via WebSocket if available
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type, payload }));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    }
    
    // Return true if we at least sent via BroadcastChannel
    return broadcastChannel !== null;
  }
  
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)?.push(callback);
    
    // Renvoyer la fonction de désabonnement
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

// Exporter une instance singleton
export const websocketService = new WebSocketService();
export default websocketService;
