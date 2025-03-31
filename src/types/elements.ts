
export type Element = {
  id: string;
  name: string;
  color: string;
  points: number;
  icon: string;
};

export type ElementAction = {
  type: 'INCREMENT' | 'DECREMENT' | 'SET';
  id: string;
  value?: number;
};
