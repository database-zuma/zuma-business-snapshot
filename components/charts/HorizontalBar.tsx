"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

interface HorizontalBarProps {
  data: { name: string; value: number }[];
  title: string;
  color?: string;
}

export default function HorizontalBar({
  data,
  title,
  color = "#00D084",
}: HorizontalBarProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            tickFormatter={(v: number) => formatRupiah(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            width={140}
          />
          <Tooltip formatter={(value) => formatRupiah(Number(value))} />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
