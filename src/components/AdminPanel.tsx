
import { useState } from 'react';
import { Element } from '@/types/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Wind, Droplet, CloudLightning, GlobeIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminPanelProps {
  elements: Element[];
  onUpdatePoints: (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET', value?: number) => void;
  onResetScores: () => void;
}

const AdminPanel = ({ elements, onUpdatePoints, onResetScores }: AdminPanelProps) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleElementSelect = (id: string) => {
    setSelectedElement(id === selectedElement ? null : id);
    setInputValue('');
  };

  const handleIncrement = () => {
    if (selectedElement) {
      onUpdatePoints(selectedElement, 'INCREMENT');
    }
  };

  const handleDecrement = () => {
    if (selectedElement) {
      const element = elements.find(e => e.id === selectedElement);
      if (element && element.points > 0) {
        onUpdatePoints(selectedElement, 'DECREMENT');
      } else {
        toast({
          title: "Opération impossible",
          description: "Les points ne peuvent pas être négatifs",
          variant: "destructive"
        });
      }
    }
  };

  const handleSetPoints = () => {
    if (selectedElement) {
      const newPoints = parseInt(inputValue);
      if (!isNaN(newPoints) && newPoints >= 0) {
        onUpdatePoints(selectedElement, 'SET', newPoints);
        setInputValue('');
      } else {
        toast({
          title: "Valeur invalide",
          description: "Veuillez entrer un nombre positif",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSetPoints();
    }
  };

  // Fonction pour obtenir l'icône correspondant à chaque élément
  const getElementIcon = (id: string) => {
    switch (id) {
      case 'fire':
        return <Flame className="h-5 w-5" />;
      case 'air':
        return <Wind className="h-5 w-5" />;
      case 'water':
        return <Droplet className="h-5 w-5" />;
      case 'lightning':
        return <CloudLightning className="h-5 w-5" />;
      case 'earth':
        return <GlobeIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-lg max-w-xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Administration des points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {elements.map(element => (
            <Button
              key={element.id}
              variant={selectedElement === element.id ? "default" : "outline"}
              onClick={() => handleElementSelect(element.id)}
              className={`flex items-center justify-center gap-2 ${selectedElement === element.id ? 'bg-' + element.id + ' text-white' : ''}`}
            >
              {getElementIcon(element.id)}
              <span>{element.name}</span>
            </Button>
          ))}
        </div>
        
        {selectedElement && (
          <div className="space-y-4">
            <div className="text-center font-medium">
              Élément sélectionné : {elements.find(e => e.id === selectedElement)?.name}
            </div>
            
            <div className="flex gap-2 mb-3">
              <Button 
                variant="outline" 
                onClick={handleDecrement}
                className="flex-1"
              >
                -
              </Button>
              <Button 
                variant="outline" 
                onClick={handleIncrement}
                className="flex-1"
              >
                +
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Nombre de points"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-grow"
              />
              <Button onClick={handleSetPoints}>
                Définir
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-8 border-t pt-4">
          <Button variant="destructive" onClick={onResetScores} className="w-full">
            Réinitialiser tous les scores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
