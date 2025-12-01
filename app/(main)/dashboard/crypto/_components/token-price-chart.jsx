"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export function TokenPriceChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No price data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.timestamp), "MMM d"),
    price: item.price,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            labelStyle={{ color: "#000" }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#C1FF72"
            strokeWidth={2}
            dot={{ fill: "#C1FF72", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

