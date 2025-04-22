
import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import AdminPanel from '@/components/AdminPanel';
import PasswordProtection from '@/components/PasswordProtection';
import WSConnectionStatus from '@/components/WSConnectionStatus';
import useWebSocket from '@/hooks/useWebSocket';
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem('elemental-scores');
    return savedElements ? JSON.parse(savedElements) : [
      { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
      { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
      { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
      { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
      { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
    ];
  });

  const { isConnected, subscribeToScoreUpdates, sendMessage, reconnect } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToScoreUpdates((updatedElements) => {
      setElements(updatedElements);
      localStorage.setItem('elemental-scores', JSON.stringify(updatedElements));
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToScoreUpdates]);

  const handleUpdatePoints = (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY', value?: number) => {
    const updatedElements = elements.map(element => {
      if (element.id === id) {
        let newPoints = element.points;
        let actionDescription = '';
        
        switch (action) {
          case 'INCREMENT':
            newPoints = element.points + 1;
            actionDescription = `+1 point pour l'équipe ${element.name}`;
            break;
          case 'DECREMENT':
            newPoints = Math.max(0, element.points - 1);
            actionDescription = `-1 point pour l'équipe ${element.name}`;
            break;
          case 'INCREMENT_BY':
            if (value !== undefined) {
              newPoints = element.points + value;
              actionDescription = `+${value} points pour l'équipe ${element.name}`;
            }
            break;
          case 'DECREMENT_BY':
            if (value !== undefined) {
              newPoints = Math.max(0, element.points - value);
              actionDescription = `-${value} points pour l'équipe ${element.name}`;
            }
            break;
          case 'SET':
            if (value !== undefined) {
              newPoints = value;
              actionDescription = `Score de l'équipe ${element.name} modifié`;
            }
            break;
        }
        
        toast({
          title: actionDescription,
          description: `Nouveau score: ${newPoints} points`,
        });
        
        return { ...element, points: newPoints };
      }
      return element;
    });
    
    setElements(updatedElements);
    localStorage.setItem('elemental-scores', JSON.stringify(updatedElements));
    
    // Envoyer la mise à jour - fonctionnera même en mode local grâce au BroadcastChannel
    sendMessage('scoreUpdate', updatedElements);
    
    if (!isConnected) {
      toast({
        title: "Mode hors ligne",
        description: "Synchronisation entre onglets uniquement. Tentative de reconnexion...",
        variant: "default",
      });
      reconnect();
    }
  };

  const resetScores = () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores ?");
    if (confirmed) {
      const resetElements = elements.map(element => ({ ...element, points: 0 }));
      setElements(resetElements);
      localStorage.setItem('elemental-scores', JSON.stringify(resetElements));
      
      sendMessage('scoreUpdate', resetElements);
      
      toast({
        title: "Scores réinitialisés",
        description: "Tous les scores ont été remis à zéro.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <PasswordProtection>
        <div className="pb-4">
          <WSConnectionStatus className="max-w-xl mx-auto" />
        </div>
        <AdminPanel 
          elements={elements}
          onUpdatePoints={handleUpdatePoints}
          onResetScores={resetScores}
        />
      </PasswordProtection>
    </div>
  );
};

export default Admin;
