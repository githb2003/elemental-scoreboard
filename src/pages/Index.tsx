
import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import AdminPanel from '@/components/AdminPanel';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialElements: Element[] = [
  { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
  { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
  { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
  { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
  { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
];

const STORAGE_KEY = 'elemental-scores';

const Index = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem(STORAGE_KEY);
    return savedElements ? JSON.parse(savedElements) : initialElements;
  });
  
  const { toast } = useToast();

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
    const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores ?");
    if (confirmed) {
      setElements(prevElements =>
        prevElements.map(element => ({ ...element, points: 0 }))
      );
      toast({
        title: "Scores réinitialisés",
        description: "Tous les scores ont été remis à zéro.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
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
          <AdminPanel 
            elements={elements}
            onUpdatePoints={handleUpdatePoints}
            onResetScores={resetScores}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
