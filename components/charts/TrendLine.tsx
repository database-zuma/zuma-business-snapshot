"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

interface TrendLineProps {
  data: { label: string; ty: number; ly: number }[];
  title: string;
}

export default function TrendLine({ data, title }: TrendLineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            tickFormatter={(v: number) => formatRupiah(v)}
          />
          <Tooltip
            formatter={(value) => formatRupiah(Number(value))}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ty"
            name="This Year"
            stroke="#00D084"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="ly"
            name="Last Year"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
