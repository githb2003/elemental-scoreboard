
export type Element = {
  id: string;
  name: string;
  color: string;
  points: number;
  icon: string;
};

export type ElementAction = {
  type: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY';
  id: string;
  value?: number;
};
