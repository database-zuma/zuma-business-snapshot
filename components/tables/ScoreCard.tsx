"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah, formatPairs, formatAsp, formatPct } from "@/lib/format";

interface ScoreCardProps {
  label: string;
  value: number | null;
  vsPrev: number | null;
  vsPrevLabel: string;
  vsLy: number | null;
  format: "currency" | "number" | "decimal";
}

function formatValue(n: number | null, fmt: string): string {
  if (n == null) return "-";
  switch (fmt) {
    case "currency":
      return formatRupiah(n);
    case "number":
      return formatPairs(n);
    case "decimal":
      return formatAsp(n);
    default:
      return String(n);
  }
}

export default function ScoreCard({
  label,
  value,
  vsPrev,
  vsPrevLabel,
  vsLy,
  format,
}: ScoreCardProps) {
  const getBadgeVariant = (val: number | null): "default" | "secondary" | "destructive" => {
    if (val == null || val === 0) return "secondary";
    return val > 0 ? "default" : "destructive";
  };

  const TrendIcon = ({ val }: { val: number | null }) => {
    if (val == null || val === 0) return null;
    return val > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  return (
    <Card className="border-t-2 border-t-[#00D084]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-amber-400 uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground tracking-tight font-mono">
          {formatValue(value, format)}
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
          {vsPrev != null && (
            <div className="flex items-center gap-2">
              <Badge variant={getBadgeVariant(vsPrev)} className="text-xs">
                <TrendIcon val={vsPrev} />
                {formatPct(vsPrev)}
              </Badge>
              <span className="text-xs text-muted-foreground">{vsPrevLabel}</span>
            </div>
          )}
          {vsLy != null && (
            <div className="flex items-center gap-2">
              <Badge variant={getBadgeVariant(vsLy)} className="text-xs">
                <TrendIcon val={vsLy} />
                {formatPct(vsLy)}
              </Badge>
              <span className="text-xs text-muted-foreground">vs LY</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
