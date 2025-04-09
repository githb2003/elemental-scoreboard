
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
        return 'url("https://images.unsplash.com/photo-1549317336-206569e8475c?q=80&w=500")';
      case 'water':
        return 'url("https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=500")';
      case 'air':
        return 'url("https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=500")';
      case 'earth':
        return 'url("https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?q=80&w=500")';
      case 'lightning':
        return 'url("https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=80&w=500")';
      default:
        return 'none';
    }
  };

  const getElementStyle = () => {
    return {
      fire: 'from-orange-500/80 to-orange-900/90 shadow-orange-400/30 border-orange-500/30',
      air: 'from-sky-400/80 to-blue-800/90 shadow-blue-400/30 border-sky-400/30',
      water: 'from-blue-400/80 to-blue-900/90 shadow-blue-400/30 border-blue-500/30',
      lightning: 'from-purple-400/80 to-purple-900/90 shadow-purple-400/30 border-purple-500/30',
      earth: 'from-amber-500/80 to-amber-900/90 shadow-amber-400/30 border-amber-500/30',
    }[element.id] || '';
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
      className={`relative overflow-hidden cursor-pointer h-full transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:scale-105 
      bg-gradient-to-br ${getElementStyle()}`}
      onClick={handleClick}
    >
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: getBackgroundImage(), 
          backgroundPosition: 'center',
          opacity: 0.9
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br opacity-50"></div>
      
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 h-full">
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
