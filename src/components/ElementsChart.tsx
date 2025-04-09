
import { Element } from '@/types/elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer,
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ElementsChartProps {
  elements: Element[];
}

const ElementsChart = ({ elements }: ElementsChartProps) => {
  // Define this function first to avoid the initialization error
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

  const chartData = elements.map(element => ({
    name: element.name,
    points: element.points,
    color: getElementColor(element.id),
    id: element.id
  }));

  // Create chart config for shadcn/ui chart
  const chartConfig = {
    fire: { color: 'hsl(12, 80%, 50%)' },
    air: { color: 'hsl(200, 70%, 80%)' },
    water: { color: 'hsl(210, 100%, 50%)' },
    lightning: { color: 'hsl(250, 90%, 60%)' },
    earth: { color: 'hsl(30, 60%, 40%)' },
  };

  return (
    <Card className="shadow-lg border rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Scores des Équipes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">{data.name}</div>
                            <div className="font-mono text-right">{data.points} points</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="points" 
                  radius={[4, 4, 0, 0]}
                  className="fill-[--color-fire] data-[name=air]:fill-[--color-air] data-[name=water]:fill-[--color-water] data-[name=lightning]:fill-[--color-lightning] data-[name=earth]:fill-[--color-earth]"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementsChart;
