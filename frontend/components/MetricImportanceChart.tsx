'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MetricImportance } from '@/lib/types';

interface MetricImportanceChartProps {
  data: MetricImportance[];
}

export default function MetricImportanceChart({ data }: MetricImportanceChartProps) {
  // Sort by importance descending and take top 20
  const chartData = [...data]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20);

  // Color gradient - top metrics more vibrant
  const getBarColor = (index: number) => {
    if (index < 3) return 'hsl(38, 92%, 50%)'; // Primary amber for top 3
    if (index < 8) return 'hsl(38, 92%, 60%)'; // Lighter amber for top 8
    return 'hsl(38, 70%, 65%)'; // Pale amber for rest
  };

  return (
    <div className="w-full">
      {/* Mobile: Smaller height, Desktop: Full height */}
      <ResponsiveContainer width="100%" height={500} className="sm:h-[600px]">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 160, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            label={{ value: 'Importance (%)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--foreground))', fontSize: 14 }}
          />
          <YAxis 
            type="category" 
            dataKey="metric"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
            width={170}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
            formatter={(value, name, props) => {
              const item = props as { payload: MetricImportance & { displayName: string } };
              return [
                `${item.payload.importancePercent.toFixed(2)}% (${item.payload.importance.toFixed(4)})`,
                'Importance'
              ];
            }}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="importancePercent" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
