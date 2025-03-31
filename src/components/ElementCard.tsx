
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

  useEffect(() => {
    if (prevPointsRef.current !== element.points) {
      setAnimate(true);
      prevPointsRef.current = element.points;

      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [element.points]);

  const getBackgroundImage = () => {
    switch (element.id) {
      case 'fire':
        return 'url(/lovable-uploads/98eaa30a-e27c-419d-905e-821f02c4d77f.png)';
      case 'water':
        return 'url(/lovable-uploads/98eaa30a-e27c-419d-905e-821f02c4d77f.png)';
      case 'air':
        return 'url(/lovable-uploads/98eaa30a-e27c-419d-905e-821f02c4d77f.png)';
      case 'earth':
        return 'url(/lovable-uploads/98eaa30a-e27c-419d-905e-821f02c4d77f.png)';
      case 'lightning':
        return 'url(/lovable-uploads/b015f7a8-fc8d-4fa0-9478-b83fa98ba18a.png)';
      default:
        return 'none';
    }
  };

  const getBackgroundPosition = () => {
    switch (element.id) {
      case 'fire':
        return '0% center'; // Position pour montrer la partie feu de l'image
      case 'earth':
        return '33.33% center'; // Position pour montrer la partie terre de l'image
      case 'air':
        return '66.66% center'; // Position pour montrer la partie air de l'image
      case 'water':
        return '100% center'; // Position pour montrer la partie eau de l'image
      default:
        return 'center';
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
          backgroundPosition: element.id !== 'lightning' ? getBackgroundPosition() : 'center',
          backgroundSize: element.id !== 'lightning' ? '400%' : 'cover',
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
        
        <div 
          ref={counterRef} 
          className={`text-7xl font-bold text-center mt-2 text-white drop-shadow-lg ${animate ? 'animate-pulse' : ''}`}
        >
          {element.points}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementCard;
