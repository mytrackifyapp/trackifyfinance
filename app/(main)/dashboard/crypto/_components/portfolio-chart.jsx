"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PortfolioChart() {
  // Mock data - in production, fetch from portfolio history
  const data = [
    { date: "Jan", value: 10000 },
    { date: "Feb", value: 12000 },
    { date: "Mar", value: 11500 },
    { date: "Apr", value: 14000 },
    { date: "May", value: 13500 },
    { date: "Jun", value: 16000 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => `$${value.toLocaleString()}`}
            labelStyle={{ color: "#000" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#C1FF72"
            strokeWidth={2}
            dot={{ fill: "#C1FF72", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

