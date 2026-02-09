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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

interface TrendLineProps {
  data: { label: string; ty: number; ly: number }[];
  title: string;
}

export default function TrendLine({ data, title }: TrendLineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="label"
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
              labelStyle={{ fontWeight: 600, color: "#e0e0e0" }}
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #262626",
                borderRadius: 0,
              }}
            />
            <Legend wrapperStyle={{ color: "#737373" }} />
            <Line
              type="monotone"
              dataKey="ty"
              name="This Year"
              stroke="#00D084"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00D084" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="ly"
              name="Last Year"
              stroke="#525252"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#525252" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
