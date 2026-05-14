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
    if (index < 3) return '#3b82f6'; // Accent blue for top 3
    if (index < 8) return '#60a5fa'; // Lighter blue for top 8
    return '#93c5fd'; // Pale blue for rest
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            type="number" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Importance (%)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 14 }}
          />
          <YAxis 
            type="category" 
            dataKey="metric"
            stroke="#64748b"
            tick={{ fill: '#e2e8f0', fontSize: 11 }}
            width={170}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
            itemStyle={{ color: '#e2e8f0' }}
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
