
import { useEffect, useState } from 'react';
import useWebSocket from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';

interface WSConnectionStatusProps {
  className?: string;
  hideErrors?: boolean;
}

const WSConnectionStatus = ({ className = '', hideErrors = false }: WSConnectionStatusProps) => {
  const { isConnected, reconnect } = useWebSocket();
  const [showLocalSyncMessage, setShowLocalSyncMessage] = useState(false);
  
  // Masquer les messages d'erreur si hideErrors est true
  useEffect(() => {
    if (!isConnected && !hideErrors) {
      const timer = setTimeout(() => {
        setShowLocalSyncMessage(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLocalSyncMessage(false);
    }
  }, [isConnected, hideErrors]);

  if (hideErrors) return null;

  return (
    <div className={`p-4 rounded-md ${className} ${isConnected ? 'bg-green-950/20' : 'bg-red-950/20'}`}>
      {isConnected ? (
        <div className="flex items-center justify-center text-green-500 gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm">Connecté en temps réel</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-red-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-sm">
              La connexion WebSocket n'est pas établie.
              <br className="sm:hidden" />
              <span className="text-gray-400">
                {showLocalSyncMessage 
                  ? "Synchronisation entre onglets active." 
                  : "Tentative de connexion..."}
              </span>
            </span>
          </div>
          <Button variant="destructive" onClick={reconnect} size="sm">
            Reconnecter
          </Button>
        </div>
      )}
    </div>
  );
};

export default WSConnectionStatus;
