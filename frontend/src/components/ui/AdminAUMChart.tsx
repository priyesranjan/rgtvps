"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

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
          tickFormatter={(v) => `₹${v}Cr`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#0B1120", borderColor: "#D4AF37", borderRadius: "8px", color: "#fff" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`₹${Number(value ?? 0)} Crore`, "Total AUM"]}
        />
        <Area type="monotone" dataKey="aum" stroke="#D4AF37" strokeWidth={3}
          fillOpacity={1} fill="url(#aumGradient)" dot={{ fill: "#D4AF37", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#D4AF37" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
