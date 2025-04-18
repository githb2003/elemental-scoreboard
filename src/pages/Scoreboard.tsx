
import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import useWebSocket from '@/hooks/useWebSocket';

const Scoreboard = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem('elemental-scores') ?? JSON.stringify([
      { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
      { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
      { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
      { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
      { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
    ]);
    return JSON.parse(savedElements);
  });

  const navigate = useNavigate();
  const { subscribeToScoreUpdates } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToScoreUpdates((updatedElements) => {
      setElements(updatedElements);
      localStorage.setItem('elemental-scores', JSON.stringify(updatedElements));
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToScoreUpdates]);

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
      <div className="container mx-auto px-4 py-2">
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Admin
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-screen items-center px-4">
          {elements.map(element => (
            <ElementCard 
              key={element.id}
              element={element}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
