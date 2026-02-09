/**
 * Safely coerce a value to number. pg returns numeric/bigint as strings.
 */
function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * Format a number as Indonesian Rupiah with abbreviation.
 * Rp 86.99 Bn, Rp 5.88 Bn, Rp 84.2 M, Rp 1.2 K
 */
export function formatRupiah(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null) return "-";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} Bn`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} M`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(1)} K`;
  }
  return `${sign}Rp ${abs.toFixed(0)}`;
}

/**
 * Format pairs count with abbreviation: 12.5K, 1.2M
 */
export function formatPairs(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null) return "-";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${abs.toLocaleString()}`;
}

/**
 * Format a percentage value: +12.5%, -4.0%, null → "-"
 */
export function formatPct(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

/**
 * Get CSS color class for a percentage change.
 * Positive = green, negative = red, zero/null = gray.
 */
export function pctColor(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null || n === 0) return "text-gray-500";
  return n > 0 ? "text-emerald-600" : "text-red-600";
}

/**
 * Format ASP (average selling price) as Rupiah without abbreviation.
 */
export function formatAsp(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null) return "-";
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

/**
 * Parse and color-code sales:stock ratio.
 * "1:X" → parse X → 0-1=red, 2-4=green, 5-7=yellow, 8+=yellow
 */
export function formatRatio(ratio: string | null | undefined): {
  text: string;
  color: string;
} {
  if (!ratio) return { text: "-", color: "text-gray-400" };

  const match = ratio.match(/1:(\d+)/);
  if (!match) return { text: ratio, color: "text-gray-400" };

  const x = parseInt(match[1], 10);
  let color = "text-gray-400";

  if (x <= 1) {
    color = "text-red-600";
  } else if (x >= 2 && x <= 4) {
    color = "text-emerald-600";
  } else if (x >= 5 && x <= 7) {
    color = "text-yellow-600";
  } else if (x >= 8) {
    color = "text-yellow-600";
  }

  return { text: ratio, color };
}

/**
 * Format a number with commas: 1,234,567
 */
export function formatNumber(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n == null) return "-";
  return Math.round(n).toLocaleString("id-ID");
}

/**
 * Get the vs-previous label based on period type.
 */
export function vsPrevLabel(
  periodType: string
): string {
  switch (periodType) {
    case "yearly":
      return "YoY";
    case "quarterly":
      return "QoQ";
    case "monthly":
      return "MoM";
    case "weekly":
      return "WoW";
    default:
      return "vs Prev";
  }
}
