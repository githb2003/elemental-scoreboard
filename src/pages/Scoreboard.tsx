
import { useState } from 'react';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Scoreboard = () => {
  const [elements] = useState<Element[]>(() => {
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

  return (
    <div className={`min-h-screen transition-colors duration-700 bg-black`}>
      <div className="container mx-auto px-4 py-2">
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Admin
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-4 h-screen items-center px-4">
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
