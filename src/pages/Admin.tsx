
import AdminPanel from '@/components/AdminPanel';
import { useState } from 'react';
import { Element } from '@/types/elements';
import PasswordProtection from '@/components/PasswordProtection';

const Admin = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem('elemental-scores');
    return savedElements ? JSON.parse(savedElements) : [];
  });

  const handleUpdatePoints = (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY', value?: number) => {
    const updatedElements = elements.map(element => {
      if (element.id === id) {
        let newPoints = element.points;
        switch (action) {
          case 'INCREMENT':
            newPoints = element.points + 1;
            break;
          case 'DECREMENT':
            newPoints = Math.max(0, element.points - 1);
            break;
          case 'SET':
            if (value !== undefined) newPoints = value;
            break;
          case 'INCREMENT_BY':
            if (value !== undefined) newPoints = element.points + value;
            break;
          case 'DECREMENT_BY':
            if (value !== undefined) newPoints = Math.max(0, element.points - value);
            break;
        }
        return { ...element, points: newPoints };
      }
      return element;
    });
    setElements(updatedElements);
    localStorage.setItem('elemental-scores', JSON.stringify(updatedElements));
  };

  const resetScores = () => {
    const resetElements = elements.map(element => ({ ...element, points: 0 }));
    setElements(resetElements);
    localStorage.setItem('elemental-scores', JSON.stringify(resetElements));
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <PasswordProtection>
        <AdminPanel 
          elements={elements}
          onUpdatePoints={handleUpdatePoints}
          onResetScores={resetScores}
        />
      </PasswordProtection>
    </div>
  );
};

export default Admin;
