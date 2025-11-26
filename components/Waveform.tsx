import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface WaveformProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Waveform: React.FC<WaveformProps> = ({ data, color = "#8884d8", height = 60 }) => {
  const chartData = useMemo(() => {
    // Downsample for performance if needed, though recharts handles moderate amounts well.
    // We'll take a subset of points to make it look like a waveform.
    const samples = 100;
    const step = Math.ceil(data.length / samples);
    const result = [];
    for (let i = 0; i < data.length; i += step) {
        result.push({ value: data[i] });
    }
    return result;
  }, [data]);

  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
            </defs>
          <YAxis hide domain={[-1, 1]} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fill={`url(#gradient-${color})`} 
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
