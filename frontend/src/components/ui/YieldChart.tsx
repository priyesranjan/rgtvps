"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Props {
  data: { name: string; yield: number }[];
}

export default function YieldChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${v / 1000}k`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0B1120', borderColor: '#D4AF37', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#D4AF37' }}
          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Yield Earned']}
        />
        <Area
          type="monotone"
          dataKey="yield"
          stroke="#D4AF37"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorYield)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
