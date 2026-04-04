"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { name: string; goldAdvance: number; withdrawable: number }[];
}

export default function YieldChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAdvance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorWithdrawable" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#6b7280"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${Number(v).toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0B1120', borderColor: '#D4AF37', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
          itemStyle={{ fontSize: '12px' }}
          formatter={(value: string | number | readonly (string | number)[] | undefined, name: string | number | symbol | undefined) => [
            formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0))),
            name === "goldAdvance" ? "Total Gold Advance" : "Total Withdrawable"
          ]}
        />
        {/* Total Withdrawable (Earnings + Capital) */}
        <Area
          type="monotone"
          dataKey="withdrawable"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorWithdrawable)"
        />
        {/* Base Capital (Gold Advance) */}
        <Area
          type="monotone"
          dataKey="goldAdvance"
          stroke="#D4AF37"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorAdvance)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


