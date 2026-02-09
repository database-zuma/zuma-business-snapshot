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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#262626" }}
              tickFormatter={(v: number) => formatRupiah(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#262626" }}
              width={140}
            />
            <Tooltip 
              formatter={(value) => formatRupiah(Number(value))}
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #262626",
                borderRadius: 0,
              }}
            />
            <Bar dataKey="value" fill={color} radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
