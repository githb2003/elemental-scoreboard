
import { useState, useEffect } from 'react';
import { Element, ElementAction } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import ElementsChart from '@/components/ElementsChart';
import DashboardHeader from '@/components/DashboardHeader';
import { useToast } from "@/components/ui/use-toast";

const initialElements: Element[] = [
  { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
  { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
  { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
  { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
  { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
];

// Clé pour le stockage local
const STORAGE_KEY = 'elemental-scores';

const Index = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    // Récupération des scores depuis le stockage local si disponible
    const savedElements = localStorage.getItem(STORAGE_KEY);
    return savedElements ? JSON.parse(savedElements) : initialElements;
  });
  
  const { toast } = useToast();

  // Sauvegarde dans le stockage local à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

  const handleUpdatePoints = (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET', value?: number) => {
    setElements(prevElements => 
      prevElements.map(element => {
        if (element.id === id) {
          let newPoints = element.points;
          
          switch (action) {
            case 'INCREMENT':
              newPoints = element.points + 1;
              toast({
                title: `+1 point pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'DECREMENT':
              newPoints = Math.max(0, element.points - 1);
              toast({
                title: `-1 point pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'SET':
              if (value !== undefined) {
                newPoints = value;
                toast({
                  title: `Score de l'équipe ${element.name} modifié`,
                  description: `Nouveau score: ${newPoints} points`,
                });
              }
              break;
          }
          
          return { ...element, points: newPoints };
        }
        return element;
      })
    );
  };

  const resetScores = () => {
    setElements(prevElements =>
      prevElements.map(element => ({ ...element, points: 0 }))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader resetScores={resetScores} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {elements.map(element => (
          <ElementCard 
            key={element.id}
            element={element}
            onUpdatePoints={handleUpdatePoints}
          />
        ))}
      </div>
      
      <div className="mt-8">
        <ElementsChart elements={elements} />
      </div>
    </div>
  );
};

export default Index;
