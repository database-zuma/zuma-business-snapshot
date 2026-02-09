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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">
                Place
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">
                Series
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">
                Revenue
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">
                Pairs
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">
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
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={grouped[place].length}
                        className="px-4 py-2 font-medium text-gray-800"
                      >
                        {place || "Unassigned"}
                      </td>
                    )}
                    <td className="px-4 py-2 text-gray-400">{row.rank_within_place}</td>
                    <td className="px-4 py-2 text-gray-700">{row.series}</td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {formatRupiah(Number(row.revenue))}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {formatPairs(Number(row.pairs))}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
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
