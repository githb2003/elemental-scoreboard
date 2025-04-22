
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
  
  connect() {
    // Si déjà en train de se connecter, renvoyer la promesse existante
    if (this.connectionPromise && this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      return this.connectionPromise;
    }
    
    // Créer une nouvelle promesse de connexion
    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolve = resolve;
      
      // Essayer d'abord en mode WebSocket
      this.connectWebSocket()
        .then(success => {
          if (!success) {
            console.log('WebSocket connection failed, using local sync only');
            this.useLocalSync = true;
          }
          if (this.connectionResolve) {
            this.connectionResolve(true);
            this.connectionResolve = null;
          }
        });
    });
    
    return this.connectionPromise;
  }
  
  private connectWebSocket(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Fermer toute connexion existante
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
        
        // Utiliser WebSocket sécurisé si sur HTTPS
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        this.socket = new WebSocket(`${protocol}//${host}/ws`);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.useLocalSync = false;
          
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
          console.log('WebSocket connection closed');
          
          // Notifier les écouteurs de la déconnexion
          this.notifyListeners('connection', { status: 'disconnected' });
          
          this.attemptReconnect();
          resolve(false);
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Socket will automatically close after error
          resolve(false);
        };
        
        // Timeout au cas où la connexion prend trop de temps
        setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            resolve(false);
          }
        }, 5000);
        
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        resolve(false);
      }
    });
  }
  
  private attemptReconnect() {
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
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connectWebSocket();
    }, delay);
  }
  
  isConnected(): boolean {
    if (this.useLocalSync) return false;
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  sendMessage(type: string, payload: any) {
    // Diffuser aux autres onglets via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload });
    }
    
    // Notifier les écouteurs locaux
    this.notifyListeners(type, payload);
    
    // Envoyer via WebSocket si disponible
    if (!this.useLocalSync && this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type, payload }));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    }
    
    return this.useLocalSync; // Considéré comme réussi en mode local
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
    
    if (broadcastChannel) {
      broadcastChannel.close();
    }
  }
}

// Exporter une instance singleton
export const websocketService = new WebSocketService();
export default websocketService;
