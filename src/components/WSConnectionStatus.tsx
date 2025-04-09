
import { useEffect } from 'react';
import useWebSocket from '@/hooks/useWebSocket';

interface WSConnectionStatusProps {
  className?: string;
}

const WSConnectionStatus = ({ className = '' }: WSConnectionStatusProps) => {
  const { isConnected } = useWebSocket();

  return (
    <div className={`p-2 rounded-md ${className}`}>
      {isConnected ? (
        <div className="flex items-center justify-center text-green-600 gap-1">
          <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
          <span className="text-xs">Connecté en temps réel</span>
        </div>
      ) : (
        <div className="flex items-center justify-center text-red-600 gap-1">
          <span className="h-2 w-2 rounded-full bg-red-600"></span>
          <span className="text-xs">Déconnecté</span>
        </div>
      )}
    </div>
  );
};

export default WSConnectionStatus;
