"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "#C1FF72",
  "#A8E063",
  "#8BCC5E",
  "#6FB359",
  "#539A54",
  "#3D814F",
  "#2D6B4A",
  "#1E5545",
];

export function AllocationChart({ tokens = [] }) {
  const data = tokens
    .filter((token) => token.currentValue > 0)
    .map((token) => ({
      name: token.symbol,
      value: token.currentValue,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 tokens

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No token data available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

