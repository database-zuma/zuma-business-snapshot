"use client";

import { TopProductsByPlaceRow } from "@/lib/types";
import { formatRupiah, formatPairs } from "@/lib/format";

interface CrossRefTableProps {
  data: TopProductsByPlaceRow[];
  title: string;
}

export default function CrossRefTable({ data, title }: CrossRefTableProps) {
  // Group by place_name
  const grouped = data.reduce<Record<string, TopProductsByPlaceRow[]>>((acc, row) => {
    if (!acc[row.place_name]) acc[row.place_name] = [];
    acc[row.place_name].push(row);
    return acc;
  }, {});

  const placeNames = Object.keys(grouped).sort();

  return (
    <div className="rounded-none border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-amber-400">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Place
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Series
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Revenue
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Pairs
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Mix %
              </th>
            </tr>
          </thead>
          <tbody>
            {placeNames.map((place) =>
              grouped[place]
                .sort((a, b) => a.rank_within_place - b.rank_within_place)
                .map((row, idx) => (
                  <tr
                    key={`${place}-${row.rank_within_place}`}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={grouped[place].length}
                        className="px-4 py-2 font-medium text-foreground"
                      >
                        {place || "Unassigned"}
                      </td>
                    )}
                    <td className="px-4 py-2 text-muted-foreground">{row.rank_within_place}</td>
                    <td className="px-4 py-2 text-foreground">{row.series}</td>
                    <td className="px-4 py-2 text-right text-foreground font-mono">
                      {formatRupiah(Number(row.revenue))}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground font-mono">
                      {formatPairs(Number(row.pairs))}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground font-mono">
                      {row.mix_pct_within_place != null
                        ? `${Number(row.mix_pct_within_place).toFixed(1)}%`
                        : "-"}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
