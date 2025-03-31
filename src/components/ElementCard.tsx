
import { useState, useRef, useEffect } from 'react';
import { Element } from '@/types/elements';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Wind, Droplet, CloudLightning, GlobeIcon } from 'lucide-react';

interface ElementCardProps {
  element: Element;
  onCardClick?: (id: string) => void;
}

const ElementCard = ({ element, onCardClick }: ElementCardProps) => {
  const [animate, setAnimate] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const prevPointsRef = useRef(element.points);

  // Effet d'animation lors du changement de points
  useEffect(() => {
    if (prevPointsRef.current !== element.points) {
      setAnimate(true);
      prevPointsRef.current = element.points;

      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [element.points]);

  // Obtenir l'image de fond en fonction de l'élément
  const getBackgroundImage = () => {
    switch (element.id) {
      case 'fire':
        return 'url(/fire-bg.jpg)';
      case 'air':
        return 'url(/air-bg.jpg)';
      case 'water':
        return 'url(/water-bg.jpg)';
      case 'lightning':
        return 'url(/lightning-bg.jpg)';
      case 'earth':
        return 'url(/earth-bg.jpg)';
      default:
        return 'none';
    }
  };

  const getElementStyle = () => {
    return {
      fire: 'from-orange-500/80 to-orange-900/90 shadow-orange-400/30 border-fire/30',
      air: 'from-sky-400/80 to-blue-800/90 shadow-blue-400/30 border-air/30',
      water: 'from-blue-400/80 to-blue-900/90 shadow-blue-400/30 border-water/30',
      lightning: 'from-purple-400/80 to-purple-900/90 shadow-purple-400/30 border-lightning/30',
      earth: 'from-amber-500/80 to-amber-900/90 shadow-amber-400/30 border-earth/30',
    }[element.id] || '';
  };

  // Composant d'icône pour chaque élément
  const IconComponent = () => {
    switch (element.id) {
      case 'fire':
        return <Flame className="h-10 w-10 text-orange-200" />;
      case 'air':
        return <Wind className="h-10 w-10 text-sky-200" />;
      case 'water':
        return <Droplet className="h-10 w-10 text-blue-200" />;
      case 'lightning':
        return <CloudLightning className="h-10 w-10 text-purple-200" />;
      case 'earth':
        return <GlobeIcon className="h-10 w-10 text-amber-200" />;
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
      bg-gradient-to-br ${getElementStyle()} border-${element.id}/30`}
      onClick={handleClick}
      style={{ backgroundImage: getBackgroundImage(), backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-85"></div>
      
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 h-full">
        <div className="flex items-center justify-center mb-3 bg-black/20 p-2 rounded-full">
          <IconComponent />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 text-center drop-shadow-md">
          {element.name}
        </h3>
        
        <div 
          ref={counterRef} 
          className={`text-5xl font-bold text-center mt-2 text-white drop-shadow-lg ${animate ? 'animate-pulse' : ''}`}
        >
          {element.points}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementCard;
