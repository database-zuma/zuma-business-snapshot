import { pool } from "./db";

interface QueryFilters {
  periodType?: string;
  periodLabel?: string;
  branch?: string;
  placeType?: string;
}

/**
 * Build a parameterized query for a mart table.
 * All mart tables share period_type filter; some have branch.
 */
function buildQuery(
  baseTable: string,
  filters: QueryFilters,
  hasBranch: boolean = false,
  orderBy: string = "period_start DESC"
): { text: string; values: string[] } {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.periodType) {
    values.push(filters.periodType);
    conditions.push(`period_type = $${values.length}`);
  }

  if (filters.periodLabel) {
    values.push(filters.periodLabel);
    conditions.push(`period_label = $${values.length}`);
  }

  if (hasBranch && filters.branch && filters.branch !== "ALL") {
    values.push(filters.branch);
    conditions.push(`branch = $${values.length}`);
  }

  if (filters.placeType) {
    values.push(filters.placeType);
    conditions.push(`place_type = $${values.length}`);
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  const text = `SELECT * FROM ${baseTable}${where} ORDER BY ${orderBy}`;

  return { text, values };
}

export async function querySalesNational(filters: QueryFilters) {
  const q = buildQuery("mart.sales_national", filters);
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByChannel(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_channel", filters, true);
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByBranch(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_branch", filters, true);
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByArea(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_area", filters, true);
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByStore(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_store", filters, true);
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByProduct(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_product", filters, false, "revenue DESC");
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function querySalesByArticle(filters: QueryFilters) {
  const q = buildQuery("mart.sales_by_article", filters, false, "revenue DESC");
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}

export async function queryTopProductsByPlace(filters: QueryFilters) {
  const q = buildQuery(
    "mart.top_products_by_place",
    filters,
    false,
    "place_name, rank_within_place"
  );
  const { rows } = await pool.query(q.text, q.values);
  return rows;
}
