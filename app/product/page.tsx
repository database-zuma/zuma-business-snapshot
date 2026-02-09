"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  PeriodType,
  SalesByProductRow,
  SalesByArticleRow,
  ApiResponse,
} from "@/lib/types";
import {
  formatRupiah,
  formatPairs,
  formatAsp,
  formatPct,
  formatNumber,
  formatRatio,
  pctColor,
} from "@/lib/format";
import PeriodTabs from "@/components/layout/PeriodTabs";
import BarChartTYvsLY from "@/components/charts/BarChartTYvsLY";
import DonutChart from "@/components/charts/DonutChart";
import DataTable from "@/components/tables/DataTable";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { ColumnDef } from "@tanstack/react-table";

export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductContent />
    </Suspense>
  );
}

function ProductContent() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "ALL";

  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [productData, setProductData] = useState<SalesByProductRow[]>([]);
  const [articleData, setArticleData] = useState<SalesByArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prRes, arRes] = await Promise.all([
        fetch(`/api/product?period_type=${periodType}`),
        fetch(`/api/article?period_type=${periodType}`),
      ]);
      const prJson: ApiResponse<SalesByProductRow> = await prRes.json();
      const arJson: ApiResponse<SalesByArticleRow> = await arRes.json();

      if (!prJson.success) throw new Error(prJson.error);
      if (!arJson.success) throw new Error(arJson.error);

      setProductData(prJson.data);
      setArticleData(arJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [periodType, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestPeriod = productData.length > 0 ? productData[0].period_label : null;
  const productLatest = useMemo(
    () => productData.filter((r) => r.period_label === latestPeriod),
    [productData, latestPeriod]
  );
  const articleLatest = useMemo(
    () => articleData.filter((r) => r.period_label === latestPeriod),
    [articleData, latestPeriod]
  );

  // Aggregate by tipe for bar chart
  const tipeData = useMemo(() => {
    const map = new Map<string, { ty: number; ly: number }>();
    productLatest.forEach((r) => {
      const key = r.tipe || "Unknown";
      const existing = map.get(key) || { ty: 0, ly: 0 };
      existing.ty += Number(r.revenue) || 0;
      existing.ly += Number(r.revenue_ly) || 0;
      map.set(key, existing);
    });
    return Array.from(map.entries()).map(([name, vals]) => ({ name, ...vals }));
  }, [productLatest]);

  // Aggregate by gender for bar chart + donut
  const genderData = useMemo(() => {
    const map = new Map<string, { ty: number; ly: number }>();
    productLatest.forEach((r) => {
      const key = r.gender || "Unknown";
      const existing = map.get(key) || { ty: 0, ly: 0 };
      existing.ty += Number(r.revenue) || 0;
      existing.ly += Number(r.revenue_ly) || 0;
      map.set(key, existing);
    });
    return Array.from(map.entries()).map(([name, vals]) => ({ name, ...vals }));
  }, [productLatest]);

  const genderDonut = useMemo(
    () => genderData.map((g) => ({ name: g.name, value: g.ty })),
    [genderData]
  );

  // Aggregate by tier for bar chart
  const tierData = useMemo(() => {
    const map = new Map<string, { ty: number; ly: number }>();
    productLatest.forEach((r) => {
      const key = r.tier || "Unknown";
      const existing = map.get(key) || { ty: 0, ly: 0 };
      existing.ty += Number(r.revenue) || 0;
      existing.ly += Number(r.revenue_ly) || 0;
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .map(([name, vals]) => ({ name, ...vals }))
      .sort((a, b) => b.ty - a.ty);
  }, [productLatest]);

  const productColumns: ColumnDef<SalesByProductRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "series", header: "Series" },
      { accessorKey: "tipe", header: "Type" },
      { accessorKey: "gender", header: "Gender" },
      { accessorKey: "tier", header: "Tier" },
      { accessorKey: "revenue", header: "Revenue", cell: ({ getValue }) => formatRupiah(Number(getValue())) },
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
        cell: ({ getValue }) => formatPct(getValue() as string | number | null),
      },
      {
        accessorKey: "current_stock",
        header: "Stock",
        cell: ({ getValue }) => formatNumber(getValue() as string | number | null),
      },
      {
        accessorKey: "sales_stock_ratio",
        header: "Sales:Stock",
        cell: ({ getValue }) => {
          const r = formatRatio(getValue() as string | null);
          return <span className={`font-medium ${r.color}`}>{r.text}</span>;
        },
      },
    ],
    []
  );

  const articleColumns: ColumnDef<SalesByArticleRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "article", header: "Article" },
      { accessorKey: "series", header: "Series" },
      { accessorKey: "gender", header: "Gender" },
      { accessorKey: "tier", header: "Tier" },
      { accessorKey: "revenue", header: "Revenue", cell: ({ getValue }) => formatRupiah(Number(getValue())) },
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
        cell: ({ getValue }) => formatPct(getValue() as string | number | null),
      },
      {
        accessorKey: "current_stock",
        header: "Stock",
        cell: ({ getValue }) => formatNumber(getValue() as string | number | null),
      },
      {
        accessorKey: "sales_stock_ratio",
        header: "Sales:Stock",
        cell: ({ getValue }) => {
          const r = formatRatio(getValue() as string | null);
          return <span className={`font-medium ${r.color}`}>{r.text}</span>;
        },
      },
    ],
    []
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-400">Product Performance</h2>
        <PeriodTabs value={periodType} onChange={setPeriodType} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {tipeData.length > 0 && (
          <BarChartTYvsLY data={tipeData} title="Revenue by Type" />
        )}
        {genderData.length > 0 && (
          <BarChartTYvsLY data={genderData} title="Revenue by Gender" />
        )}
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {tierData.length > 0 && (
          <BarChartTYvsLY data={tierData} title="Revenue by Tier" />
        )}
        {genderDonut.length > 0 && (
          <DonutChart data={genderDonut} title="Gender Mix %" />
        )}
      </div>

      {/* Product (Series) table */}
      {productLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Series Performance — {latestPeriod}
          </h3>
          <DataTable data={productLatest} columns={productColumns} pageSize={20} />
        </div>
      )}

      {/* Article table */}
      {articleLatest.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Article Performance — {latestPeriod}
          </h3>
          <DataTable data={articleLatest} columns={articleColumns} pageSize={20} />
        </div>
      )}
    </div>
  );
}
