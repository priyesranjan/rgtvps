"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { name: string; aum: number }[];
}

export default function AdminAUMChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="aumGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false}
          tickFormatter={(v) => {
            if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
            if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
            if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
            return `₹${v}`;
          }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#0B1120", borderColor: "#D4AF37", borderRadius: "8px", color: "#fff" }}
          formatter={(value: string | number | readonly (string | number)[] | undefined) => [
            formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0))), 
            "Total Gold Advance"
          ]}
        />
        <Area type="monotone" dataKey="aum" stroke="#D4AF37" strokeWidth={3}
          fillOpacity={1} fill="url(#aumGradient)" dot={{ fill: "#D4AF37", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#D4AF37" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}


