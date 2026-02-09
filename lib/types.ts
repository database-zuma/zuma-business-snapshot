/* ── Common period columns shared by all mart tables ── */
export interface PeriodColumns {
  period_type: "yearly" | "quarterly" | "monthly" | "weekly";
  period_label: string;
  period_start: string;
}

/* ── Common metric columns shared by most mart tables ── */
export interface MetricColumns {
  revenue: number;
  revenue_prev: number | null;
  revenue_prev_pct: number | null;
  revenue_ly: number | null;
  revenue_ly_pct: number | null;

  pairs: number;
  pairs_prev: number | null;
  pairs_prev_pct: number | null;
  pairs_ly: number | null;
  pairs_ly_pct: number | null;

  asp: number;
  asp_prev: number | null;
  asp_prev_pct: number | null;
  asp_ly: number | null;
  asp_ly_pct: number | null;

  unique_articles: number;
  mix_pct: number | null;
}

/* ── Per-table row types ── */

export interface SalesNationalRow extends PeriodColumns, MetricColumns {}

export interface SalesByChannelRow extends PeriodColumns, MetricColumns {
  store_category: string;
}

export interface SalesByBranchRow extends PeriodColumns, MetricColumns {
  branch: string;
}

export interface SalesByAreaRow extends PeriodColumns, MetricColumns {
  branch: string;
  area: string;
}

export interface SalesByStoreRow extends PeriodColumns, MetricColumns {
  branch: string;
  area: string;
  store_category: string;
  matched_store_name: string;
}

export interface SalesByProductRow extends PeriodColumns, MetricColumns {
  tipe: string;
  gender: string;
  series: string;
  tier: string;
  current_stock: number | null;
  sales_stock_ratio: string | null;
}

export interface SalesByArticleRow extends PeriodColumns, MetricColumns {
  article: string;
  series: string;
  gender: string;
  tier: string;
  tipe: string;
  current_stock: number | null;
  sales_stock_ratio: string | null;
}

export interface TopProductsByPlaceRow {
  period_type: string;
  period_label: string;
  place_type: string;
  place_name: string;
  series: string;
  revenue: number;
  pairs: number;
  mix_pct_within_place: number;
  rank_within_place: number;
}

/* ── API response wrapper ── */
export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
}

/* ── Period type for tabs ── */
export type PeriodType = "yearly" | "quarterly" | "monthly" | "weekly";
