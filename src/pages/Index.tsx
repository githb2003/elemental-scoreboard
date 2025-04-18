import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import AdminPanel from '@/components/AdminPanel';
import DashboardHeader from '@/components/DashboardHeader';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { websocketService } from '@/services/websocketService';
import useWebSocket from '@/hooks/useWebSocket';
import PasswordProtection from '@/components/PasswordProtection';
import { Button } from '@/components/ui/button';

const initialElements: Element[] = [
  { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
  { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
  { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
  { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
  { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
];

const STORAGE_KEY = 'elemental-scores';

const Index = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem(STORAGE_KEY);
    return savedElements ? JSON.parse(savedElements) : initialElements;
  });
  
  const { toast } = useToast();
  const { isConnected, subscribeToScoreUpdates, sendMessage, reconnect } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToScoreUpdates((updatedElements) => {
      setElements(updatedElements);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedElements));
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToScoreUpdates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

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
    
    if (isConnected) {
      sendMessage('scoreUpdate', updatedElements);
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Les autres clients ne recevront pas cette mise à jour. Reconnexion en cours...",
        variant: "destructive",
      });
      reconnect();
    }
  };

  const resetScores = () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores ?");
    if (confirmed) {
      const resetElements = elements.map(element => ({ ...element, points: 0 }));
      
      setElements(resetElements);
      
      if (isConnected) {
        sendMessage('scoreUpdate', resetElements);
      }
      
      toast({
        title: "Scores réinitialisés",
        description: "Tous les scores ont été remis à zéro.",
      });
    }
  };

  const getWinningTeam = () => {
    if (!elements.length) return null;
    
    let highestScore = -1;
    let winner = null;
    
    for (const element of elements) {
      if (element.points > highestScore) {
        highestScore = element.points;
        winner = element;
      }
    }
    
    if (highestScore === 0) return null;
    
    return winner;
  };
  
  const winningTeam = getWinningTeam();
  
  const getBackgroundGradient = () => {
    if (!winningTeam) return 'bg-black';
    
    switch (winningTeam.id) {
      case 'fire':
        return 'bg-gradient-to-br from-black to-orange-950';
      case 'air':
        return 'bg-gradient-to-br from-black to-sky-950';
      case 'water':
        return 'bg-gradient-to-br from-black to-blue-950';
      case 'lightning':
        return 'bg-gradient-to-br from-black to-purple-950';
      case 'earth':
        return 'bg-gradient-to-br from-black to-amber-950';
      default:
        return 'bg-black';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${getBackgroundGradient()}`}>
      <Tabs defaultValue="scores" className="container mx-auto px-4 py-2">
        <TabsList className="fixed top-4 right-4 z-50">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="py-2">
          <div className="grid grid-cols-5 gap-4 h-screen items-center px-4">
            {elements.map(element => (
              <ElementCard 
                key={element.id}
                element={element}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="admin" className="pt-12 pb-8">
          <PasswordProtection>
            <AdminPanel 
              elements={elements}
              onUpdatePoints={handleUpdatePoints}
              onResetScores={resetScores}
            />
            {!isConnected && (
              <div className="max-w-xl mx-auto mt-4 p-4 bg-red-100 text-red-800 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-bold">⚠️ La connexion WebSocket n'est pas établie.</span>
                  <p>Les mises à jour en temps réel ne fonctionneront pas.</p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => reconnect()}
                  className="ml-4"
                >
                  Reconnecter
                </Button>
              </div>
            )}
            {isConnected && (
              <div className="max-w-xl mx-auto mt-4 p-2 text-center">
                <span className="inline-flex items-center text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span> 
                  Connecté en temps réel
                </span>
              </div>
            )}
          </PasswordProtection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
