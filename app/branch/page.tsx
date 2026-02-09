"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  PeriodType,
  SalesByBranchRow,
  SalesByAreaRow,
  TopProductsByPlaceRow,
  ApiResponse,
} from "@/lib/types";
import { formatRupiah, formatPairs, formatAsp, formatPct, pctColor } from "@/lib/format";
import PeriodTabs from "@/components/layout/PeriodTabs";
import BarChartTYvsLY from "@/components/charts/BarChartTYvsLY";
import DonutChart from "@/components/charts/DonutChart";
import DataTable from "@/components/tables/DataTable";
import CrossRefTable from "@/components/tables/CrossRefTable";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { ColumnDef } from "@tanstack/react-table";

export default function BranchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BranchContent />
    </Suspense>
  );
}

function BranchContent() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "ALL";

  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [branchData, setBranchData] = useState<SalesByBranchRow[]>([]);
  const [areaData, setAreaData] = useState<SalesByAreaRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductsByPlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [brRes, arRes, tpRes] = await Promise.all([
        fetch(`/api/branch?period_type=${periodType}&branch=${branch}`),
        fetch(`/api/area?period_type=${periodType}&branch=${branch}`),
        fetch(`/api/top-products?period_type=${periodType}&place_type=branch`),
      ]);
      const brJson: ApiResponse<SalesByBranchRow> = await brRes.json();
      const arJson: ApiResponse<SalesByAreaRow> = await arRes.json();
      const tpJson: ApiResponse<TopProductsByPlaceRow> = await tpRes.json();

      if (!brJson.success) throw new Error(brJson.error);
      if (!arJson.success) throw new Error(arJson.error);
      if (!tpJson.success) throw new Error(tpJson.error);

      setBranchData(brJson.data);
      setAreaData(arJson.data);
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

  // Get latest period from branch data
  const latestPeriod = branchData.length > 0 ? branchData[0].period_label : null;
  const branchLatest = useMemo(
    () => branchData.filter((r) => r.period_label === latestPeriod),
    [branchData, latestPeriod]
  );
  const areaLatest = useMemo(
    () => areaData.filter((r) => r.period_label === latestPeriod),
    [areaData, latestPeriod]
  );

  // Bar chart data
  const barData = useMemo(
    () =>
      branchLatest.map((r) => ({
        name: r.branch || "Unassigned",
        ty: Number(r.revenue) || 0,
        ly: Number(r.revenue_ly) || 0,
      })),
    [branchLatest]
  );

  // Donut data
  const donutData = useMemo(
    () =>
      branchLatest.map((r) => ({
        name: r.branch || "Unassigned",
        value: Number(r.revenue) || 0,
      })),
    [branchLatest]
  );

  // Top products for latest period
  const topProductsLatest = useMemo(
    () => topProducts.filter((r) => r.period_label === latestPeriod),
    [topProducts, latestPeriod]
  );

  const branchColumns: ColumnDef<SalesByBranchRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "branch", header: "Branch", cell: ({ getValue }) => getValue() || "Unassigned" },
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
      {
        accessorKey: "mix_pct",
        header: "Mix %",
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `${Number(v).toFixed(1)}%` : "-";
        },
      },
    ],
    []
  );

  const areaColumns: ColumnDef<SalesByAreaRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "area", header: "Area" },
      { accessorKey: "branch", header: "Branch", cell: ({ getValue }) => getValue() || "Unassigned" },
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
    ],
    []
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0D3B2E]">Branch & Area</h2>
        <PeriodTabs value={periodType} onChange={setPeriodType} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {barData.length > 0 && (
          <BarChartTYvsLY data={barData} title="Branch Revenue (TY vs LY)" />
        )}
        {donutData.length > 0 && (
          <DonutChart data={donutData} title="Revenue Mix by Branch" />
        )}
      </div>

      {/* Branch table */}
      {branchLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Branch Performance — {latestPeriod}
          </h3>
          <DataTable data={branchLatest} columns={branchColumns} pageSize={10} />
        </div>
      )}

      {/* Area table */}
      {areaLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Area Performance — {latestPeriod}
          </h3>
          <DataTable data={areaLatest} columns={areaColumns} pageSize={20} />
        </div>
      )}

      {/* Cross-ref */}
      {topProductsLatest.length > 0 && (
        <CrossRefTable
          data={topProductsLatest}
          title={`Top 5 Series per Branch — ${latestPeriod}`}
        />
      )}
    </div>
  );
}
