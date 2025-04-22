
import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketService } from '@/services/websocketService';

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Store subscriptions for cleanup
  const subscriptions = useRef<(() => void)[]>([]);
  
  // Initialize connection
  useEffect(() => {
    if (autoConnect) {
      websocketService.connect();
      
      // Listen for connection changes
      const unsubscribe = websocketService.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
      });
      
      subscriptions.current.push(unsubscribe);
    }
    
    return () => {
      // Clean up all subscriptions
      subscriptions.current.forEach(unsubscribe => unsubscribe());
      subscriptions.current = [];
    };
  }, [autoConnect]);
  
  // Function to subscribe to specific events
  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    const unsubscribe = websocketService.subscribe(eventType, callback);
    subscriptions.current.push(unsubscribe);
    return unsubscribe;
  }, []);
  
  // Function to send messages
  const sendMessage = useCallback((type: string, payload: any) => {
    return websocketService.sendMessage(type, payload);
  }, []);
  
  // Force reconnection
  const reconnect = useCallback(() => {
    return websocketService.connect();
  }, []);
  
  // Common use case: subscribe to score updates
  const subscribeToScoreUpdates = useCallback((callback: (elements: any[]) => void) => {
    return subscribe('scoreUpdate', callback);
  }, [subscribe]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    reconnect,
    subscribeToScoreUpdates
  };
};

export default useWebSocket;
