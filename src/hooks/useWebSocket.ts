
import { useEffect, useRef, useState } from 'react';
import { websocketService } from '@/services/websocketService';

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
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
  const subscribe = (eventType: string, callback: (data: any) => void) => {
    const unsubscribe = websocketService.subscribe(eventType, callback);
    subscriptions.current.push(unsubscribe);
    return unsubscribe;
  };
  
  // Function to send messages
  const sendMessage = (type: string, payload: any) => {
    return websocketService.sendMessage(type, payload);
  };
  
  // Common use case: subscribe to score updates
  const subscribeToScoreUpdates = (callback: (elements: any[]) => void) => {
    return subscribe('scoreUpdate', callback);
  };
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    subscribeToScoreUpdates
  };
};

export default useWebSocket;
