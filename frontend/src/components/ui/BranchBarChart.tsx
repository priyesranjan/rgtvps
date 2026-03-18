"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: { name: string; deposits: number; withdrawals: number }[];
}

export default function BranchBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          cursor={{ fill: "#ffffff0a" }}
          contentStyle={{ backgroundColor: "#0B1120", borderColor: "#D4AF37", borderRadius: "8px", color: "#fff" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [`₹${Number(value ?? 0).toLocaleString()}`, name === "deposits" ? "Deposits" : "Withdrawals"]}
        />
        <Legend formatter={(v) => v === "deposits" ? "Deposits" : "Withdrawals"} iconType="circle" />
        <Bar dataKey="deposits" name="deposits" fill="#D4AF37" radius={[4, 4, 0, 0]} />
        <Bar dataKey="withdrawals" name="withdrawals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
