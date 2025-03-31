
import React, { useEffect, useRef } from 'react';
import { Element } from '@/types/elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ElementsChartProps {
  elements: Element[];
}

const ElementsChart: React.FC<ElementsChartProps> = ({ elements }) => {
  const chartData = elements.map(element => ({
    name: element.name,
    points: element.points,
    color: element.color,
    id: element.id
  }));

  const getElementColor = (id: string) => {
    switch (id) {
      case 'fire': return 'hsl(12, 80%, 50%)';
      case 'air': return 'hsl(200, 70%, 80%)';
      case 'water': return 'hsl(210, 100%, 50%)';
      case 'lightning': return 'hsl(250, 90%, 60%)';
      case 'earth': return 'hsl(30, 60%, 40%)';
      default: return '#888';
    }
  };

  return (
    <Card className="shadow-lg border rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Scores des Équipes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px' }}
                formatter={(value, name) => [`${value} points`, 'Score']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="points">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getElementColor(entry.id)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementsChart;
