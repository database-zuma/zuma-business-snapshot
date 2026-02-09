"use client";

import { formatRupiah, formatPairs, formatAsp, formatPct, pctColor } from "@/lib/format";

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
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0D3B2E]">
        {formatValue(value, format)}
      </p>
      <div className="mt-3 flex flex-col gap-1">
        {vsPrev != null && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${pctColor(vsPrev)}`}>
              {formatPct(vsPrev)}
            </span>
            <span className="text-gray-400">{vsPrevLabel}</span>
          </div>
        )}
        {vsLy != null && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${pctColor(vsLy)}`}>
              {formatPct(vsLy)}
            </span>
            <span className="text-gray-400">vs LY</span>
          </div>
        )}
      </div>
    </div>
  );
}
