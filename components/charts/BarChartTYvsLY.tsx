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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

interface BarChartTYvsLYProps {
  data: { name: string; ty: number; ly: number }[];
  title: string;
}

export default function BarChartTYvsLY({ data, title }: BarChartTYvsLYProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#262626" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#262626" }}
              tickFormatter={(v: number) => formatRupiah(v)}
            />
            <Tooltip 
              formatter={(value) => formatRupiah(Number(value))}
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #262626",
                borderRadius: 0,
              }}
            />
            <Legend wrapperStyle={{ color: "#737373" }} />
            <Bar dataKey="ty" name="This Year" fill="#00D084" radius={[0, 0, 0, 0]} />
            <Bar dataKey="ly" name="Last Year" fill="#525252" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
