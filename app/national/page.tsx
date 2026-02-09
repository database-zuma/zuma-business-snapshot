"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PeriodType, SalesNationalRow, SalesByChannelRow, ApiResponse } from "@/lib/types";
import { formatRupiah, formatPairs, formatAsp, formatPct, pctColor, vsPrevLabel } from "@/lib/format";
import PeriodTabs from "@/components/layout/PeriodTabs";
import ScoreCard from "@/components/tables/ScoreCard";
import TrendLine from "@/components/charts/TrendLine";
import DonutChart from "@/components/charts/DonutChart";
import DataTable from "@/components/tables/DataTable";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { ColumnDef } from "@tanstack/react-table";

export default function NationalPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NationalContent />
    </Suspense>
  );
}

function NationalContent() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "ALL";

  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [nationalData, setNationalData] = useState<SalesNationalRow[]>([]);
  const [channelData, setChannelData] = useState<SalesByChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [natRes, chanRes] = await Promise.all([
        fetch(`/api/national?period_type=${periodType}`),
        fetch(`/api/channel?period_type=${periodType}&branch=${branch}`),
      ]);
      const natJson: ApiResponse<SalesNationalRow> = await natRes.json();
      const chanJson: ApiResponse<SalesByChannelRow> = await chanRes.json();

      if (!natJson.success) throw new Error(natJson.error || "Failed to fetch national data");
      if (!chanJson.success) throw new Error(chanJson.error || "Failed to fetch channel data");

      setNationalData(natJson.data);
      setChannelData(chanJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [periodType, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = nationalData.length > 0 ? nationalData[0] : null;
  const prevLabel = vsPrevLabel(periodType);

  // Build trend data: TY vs LY from monthly data
  const trendData = useMemo(() => {
    if (periodType !== "monthly") return [];
    // Sort ascending for chart
    const sorted = [...nationalData].sort(
      (a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
    );
    return sorted.map((row) => ({
      label: row.period_label,
      ty: Number(row.revenue) || 0,
      ly: Number(row.revenue_ly) || 0,
    }));
  }, [nationalData, periodType]);

  // Channel donut: latest period only
  const latestPeriod = latest?.period_label;
  const channelLatest = useMemo(
    () => channelData.filter((r) => r.period_label === latestPeriod),
    [channelData, latestPeriod]
  );

  const donutData = useMemo(
    () =>
      channelLatest.map((r) => ({
        name: r.store_category || "Unassigned",
        value: Number(r.revenue) || 0,
      })),
    [channelLatest]
  );

  const channelColumns: ColumnDef<SalesByChannelRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "store_category", header: "Channel" },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ getValue }) => formatRupiah(Number(getValue())),
      },
      {
        accessorKey: "revenue_ly",
        header: "Revenue LY",
        cell: ({ getValue }) => formatRupiah(Number(getValue())),
      },
      {
        accessorKey: "revenue_ly_pct",
        header: "YoY %",
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return <span className={pctColor(v)}>{formatPct(v)}</span>;
        },
      },
      {
        accessorKey: "pairs",
        header: "Pairs",
        cell: ({ getValue }) => formatPairs(Number(getValue())),
      },
      {
        accessorKey: "asp",
        header: "ASP",
        cell: ({ getValue }) => formatAsp(Number(getValue())),
      },
      {
        accessorKey: "mix_pct",
        header: "Mix %",
        cell: ({ getValue }) => formatPct(getValue() as string | number | null),
      },
    ],
    []
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0D3B2E]">National Overview</h2>
        <PeriodTabs value={periodType} onChange={setPeriodType} />
      </div>

      {/* Scorecards */}
      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            label="Revenue"
            value={Number(latest.revenue)}
            vsPrev={latest.revenue_prev_pct != null ? Number(latest.revenue_prev_pct) : null}
            vsPrevLabel={prevLabel}
            vsLy={latest.revenue_ly_pct != null ? Number(latest.revenue_ly_pct) : null}
            format="currency"
          />
          <ScoreCard
            label="Pairs Sold"
            value={Number(latest.pairs)}
            vsPrev={latest.pairs_prev_pct != null ? Number(latest.pairs_prev_pct) : null}
            vsPrevLabel={prevLabel}
            vsLy={latest.pairs_ly_pct != null ? Number(latest.pairs_ly_pct) : null}
            format="number"
          />
          <ScoreCard
            label="ASP"
            value={Number(latest.asp)}
            vsPrev={latest.asp_prev_pct != null ? Number(latest.asp_prev_pct) : null}
            vsPrevLabel={prevLabel}
            vsLy={latest.asp_ly_pct != null ? Number(latest.asp_ly_pct) : null}
            format="decimal"
          />
          <ScoreCard
            label="Unique Articles"
            value={Number(latest.unique_articles)}
            vsPrev={null}
            vsPrevLabel={prevLabel}
            vsLy={null}
            format="number"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {trendData.length > 0 && (
          <TrendLine data={trendData} title="Revenue Trend (TY vs LY)" />
        )}
        {donutData.length > 0 && (
          <DonutChart data={donutData} title="Revenue by Channel" />
        )}
      </div>

      {/* Channel table */}
      {channelLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Channel Breakdown — {latestPeriod}
          </h3>
          <DataTable data={channelLatest} columns={channelColumns} pageSize={10} />
        </div>
      )}
    </div>
  );
}
