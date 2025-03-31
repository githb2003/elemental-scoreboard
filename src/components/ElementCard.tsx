
import { useState, useRef, useEffect } from 'react';
import { Element } from '@/types/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fire, AirVent, Droplet, CloudLightning, Earth } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ElementCardProps {
  element: Element;
  onUpdatePoints: (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET', value?: number) => void;
}

const ElementCard = ({ element, onUpdatePoints }: ElementCardProps) => {
  const [inputValue, setInputValue] = useState('');
  const [animate, setAnimate] = useState(false);
  const { toast } = useToast();
  const counterRef = useRef<HTMLDivElement>(null);

  // Mapping des icônes pour chaque élément
  const IconComponent = () => {
    switch (element.id) {
      case 'fire':
        return <Fire className="h-8 w-8 text-fire" />;
      case 'air':
        return <AirVent className="h-8 w-8 text-air" />;
      case 'water':
        return <Droplet className="h-8 w-8 text-water" />;
      case 'lightning':
        return <CloudLightning className="h-8 w-8 text-lightning" />;
      case 'earth':
        return <Earth className="h-8 w-8 text-earth" />;
      default:
        return null;
    }
  };

  // Animation lors du changement de points
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const handleIncrement = () => {
    onUpdatePoints(element.id, 'INCREMENT');
    setAnimate(true);
  };

  const handleDecrement = () => {
    if (element.points > 0) {
      onUpdatePoints(element.id, 'DECREMENT');
      setAnimate(true);
    } else {
      toast({
        title: "Opération impossible",
        description: "Les points ne peuvent pas être négatifs",
        variant: "destructive"
      });
    }
  };

  const handleSetPoints = () => {
    const newPoints = parseInt(inputValue);
    if (!isNaN(newPoints) && newPoints >= 0) {
      onUpdatePoints(element.id, 'SET', newPoints);
      setInputValue('');
      setAnimate(true);
    } else {
      toast({
        title: "Valeur invalide",
        description: "Veuillez entrer un nombre positif",
        variant: "destructive"
      });
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

  // On applique une classe de style basée sur l'élément
  const getElementStyle = () => {
    return {
      fire: 'bg-gradient-to-br from-orange-100 to-orange-50 border-fire/30',
      air: 'bg-gradient-to-br from-blue-100 to-blue-50 border-air/30',
      water: 'bg-gradient-to-br from-blue-200 to-blue-100 border-water/30',
      lightning: 'bg-gradient-to-br from-purple-100 to-purple-50 border-lightning/30',
      earth: 'bg-gradient-to-br from-amber-100 to-amber-50 border-earth/30',
    }[element.id] || '';
  };

  return (
    <Card className={`border-2 shadow-lg ${getElementStyle()} h-full`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="font-bold text-xl">{element.name}</span>
          <IconComponent />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={counterRef} 
          className={`text-4xl font-bold text-center my-4 ${animate ? 'animate-pulse' : ''}`}
          style={{ color: `hsl(var(--${element.id}))` }}
        >
          {element.points}
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
      </CardContent>
    </Card>
  );
};

export default ElementCard;
