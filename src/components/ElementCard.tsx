
import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Wind, Droplet, CloudLightning, GlobeIcon } from 'lucide-react';

interface ElementCardProps {
  element: Element;
  onCardClick?: (id: string) => void;
}

const ElementCard = ({ element, onCardClick }: ElementCardProps) => {
  const [animate, setAnimate] = useState(false);
  const [prevPoints, setPrevPoints] = useState(element.points);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPoints !== element.points) {
      const dir = element.points > prevPoints ? 'up' : 'down';
      setDirection(dir);
      setAnimate(true);
      setPrevPoints(element.points);

      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [element.points, prevPoints]);

  const getBackgroundImage = () => {
    switch (element.id) {
      case 'fire':
        return 'url("/lovable-uploads/ddeea1a9-0a13-4192-a794-6be7feaad9de.png")';
      case 'water':
        return 'url("/lovable-uploads/cd9afc21-b5f9-48af-8012-3cdd24137ea8.png")';
      case 'air':
        return 'url("/lovable-uploads/86ee5a90-3e88-45c0-ad4c-8b0c0bb4f83d.png")';
      case 'earth':
        return 'url("/lovable-uploads/1b44d083-8613-49de-8892-f8bbae6d79a7.png")';
      case 'lightning':
        return 'url("/lovable-uploads/6a479c0c-6695-439d-9549-a00f009acd38.png")';
      default:
        return 'none';
    }
  };
  
  const IconComponent = () => {
    switch (element.id) {
      case 'fire':
        return <Flame className="h-12 w-12 text-orange-200" />;
      case 'air':
        return <Wind className="h-12 w-12 text-sky-200" />;
      case 'water':
        return <Droplet className="h-12 w-12 text-blue-200" />;
      case 'lightning':
        return <CloudLightning className="h-12 w-12 text-purple-200" />;
      case 'earth':
        return <GlobeIcon className="h-12 w-12 text-amber-200" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (onCardClick) {
      onCardClick(element.id);
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer h-full transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:scale-105`}
      onClick={handleClick}
    >
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: getBackgroundImage(), 
          backgroundPosition: 'center',
          backgroundSize: 'cover', // Assurez-vous que l'image couvre tout le fond
          opacity: 1 // Image complètement visible sans filtre
        }}
      />
      
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 h-full bg-black/30">
        <div className="flex items-center justify-center mb-4 bg-black/30 p-3 rounded-full">
          <IconComponent />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 text-center drop-shadow-md">
          {element.name}
        </h3>
        
        <div className="relative">
          {animate && direction === 'up' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-bold opacity-0 animate-fadeUpAndOut">
              +{element.points - prevPoints}
            </div>
          )}
          
          {animate && direction === 'down' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-400 font-bold opacity-0 animate-fadeUpAndOut">
              -{prevPoints - element.points}
            </div>
          )}
          
          <div 
            className={`text-7xl font-bold text-center mt-2 text-white drop-shadow-lg transition-all duration-300 
              ${animate ? 'scale-125 ' + (direction === 'up' ? 'text-green-300' : direction === 'down' ? 'text-red-300' : '') : ''}`}
          >
            {element.points}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementCard;
