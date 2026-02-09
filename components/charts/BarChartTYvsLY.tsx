"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

interface BarChartTYvsLYProps {
  data: { name: string; ty: number; ly: number }[];
  title: string;
}

export default function BarChartTYvsLY({ data, title }: BarChartTYvsLYProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            tickFormatter={(v: number) => formatRupiah(v)}
          />
          <Tooltip formatter={(value) => formatRupiah(Number(value))} />
          <Legend />
          <Bar dataKey="ty" name="This Year" fill="#00D084" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ly" name="Last Year" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
