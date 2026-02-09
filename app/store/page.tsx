"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  PeriodType,
  SalesByStoreRow,
  TopProductsByPlaceRow,
  ApiResponse,
} from "@/lib/types";
import { formatRupiah, formatPairs, formatAsp, formatPct, pctColor } from "@/lib/format";
import PeriodTabs from "@/components/layout/PeriodTabs";
import HorizontalBar from "@/components/charts/HorizontalBar";
import DataTable from "@/components/tables/DataTable";
import CrossRefTable from "@/components/tables/CrossRefTable";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { ColumnDef } from "@tanstack/react-table";

export default function StorePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "ALL";

  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [storeData, setStoreData] = useState<SalesByStoreRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductsByPlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stRes, tpRes] = await Promise.all([
        fetch(`/api/store?period_type=${periodType}&branch=${branch}`),
        fetch(`/api/top-products?period_type=${periodType}&place_type=store`),
      ]);
      const stJson: ApiResponse<SalesByStoreRow> = await stRes.json();
      const tpJson: ApiResponse<TopProductsByPlaceRow> = await tpRes.json();

      if (!stJson.success) throw new Error(stJson.error);
      if (!tpJson.success) throw new Error(tpJson.error);

      setStoreData(stJson.data);
      setTopProducts(tpJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [periodType, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestPeriod = storeData.length > 0 ? storeData[0].period_label : null;
  const storeLatest = useMemo(
    () => storeData.filter((r) => r.period_label === latestPeriod),
    [storeData, latestPeriod]
  );

  // Top 10 / Bottom 10 by revenue
  const sorted = useMemo(
    () => [...storeLatest].sort((a, b) => Number(b.revenue) - Number(a.revenue)),
    [storeLatest]
  );
  const top10 = useMemo(
    () =>
      sorted.slice(0, 10).map((r) => ({
        name: r.matched_store_name || "Unknown",
        value: Number(r.revenue) || 0,
      })),
    [sorted]
  );
  const bottom10 = useMemo(
    () =>
      sorted
        .slice(-10)
        .reverse()
        .map((r) => ({
          name: r.matched_store_name || "Unknown",
          value: Number(r.revenue) || 0,
        })),
    [sorted]
  );

  const topProductsLatest = useMemo(
    () => topProducts.filter((r) => r.period_label === latestPeriod),
    [topProducts, latestPeriod]
  );

  const storeColumns: ColumnDef<SalesByStoreRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "matched_store_name", header: "Store", cell: ({ getValue }) => getValue() || "Unknown" },
      { accessorKey: "branch", header: "Branch", cell: ({ getValue }) => getValue() || "Unassigned" },
      { accessorKey: "area", header: "Area" },
      { accessorKey: "store_category", header: "Category" },
      { accessorKey: "revenue", header: "Revenue", cell: ({ getValue }) => formatRupiah(Number(getValue())) },
      { accessorKey: "revenue_ly", header: "Revenue LY", cell: ({ getValue }) => formatRupiah(Number(getValue())) },
      {
        accessorKey: "revenue_ly_pct",
        header: "YoY %",
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return <span className={pctColor(v)}>{formatPct(v)}</span>;
        },
      },
      { accessorKey: "pairs", header: "Pairs", cell: ({ getValue }) => formatPairs(Number(getValue())) },
      { accessorKey: "asp", header: "ASP", cell: ({ getValue }) => formatAsp(Number(getValue())) },
      { accessorKey: "unique_articles", header: "Articles", cell: ({ getValue }) => String(getValue() ?? "-") },
    ],
    []
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0D3B2E]">Store Performance</h2>
        <PeriodTabs value={periodType} onChange={setPeriodType} />
      </div>

      {/* Top / Bottom bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {top10.length > 0 && (
          <HorizontalBar data={top10} title="Top 10 Stores by Revenue" color="#00D084" />
        )}
        {bottom10.length > 0 && (
          <HorizontalBar data={bottom10} title="Bottom 10 Stores by Revenue" color="#f87171" />
        )}
      </div>

      {/* Store table */}
      {storeLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            All Stores — {latestPeriod}
          </h3>
          <DataTable data={storeLatest} columns={storeColumns} pageSize={20} />
        </div>
      )}

      {/* Cross-ref */}
      {topProductsLatest.length > 0 && (
        <CrossRefTable
          data={topProductsLatest}
          title={`Top 3 Series per Store — ${latestPeriod}`}
        />
      )}
    </div>
  );
}
