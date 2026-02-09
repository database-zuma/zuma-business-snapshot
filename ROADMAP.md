# Zuma Business Snapshot Dashboard — Roadmap

> Last updated: 9 Feb 2026
> Status: Building mart tables

---

## Overview

Looker Studio dashboard powered by pre-computed mart tables on VPS PostgreSQL.
Data source: `core.sales_with_product` (1.47M real rows, 2022-01 to 2026-02)
Stock source: `public.stock_with_product` (142K rows, daily snapshot)

**Single filter:** Branch (report-level). All selected = National.
**No period filter** — periods are pre-baked into mart columns for speed.

---

## Metrics

| Metric | Formula | Source Columns |
|---|---|---|
| Revenue | `SUM(total_amount)` | `core.sales_with_product.total_amount` |
| Pairs | `SUM(quantity)` | `core.sales_with_product.quantity` |
| ASP | `SUM(total_amount) / NULLIF(SUM(quantity), 0)` | derived |
| Unique Articles | `COUNT(DISTINCT kode_mix)` | `core.sales_with_product.kode_mix` |
| Mix % | `Revenue of row / Total Revenue of period × 100` | derived (window) |
| Sales:Stock Ratio | `Sales pairs (period) : Current Stock pairs` | sales LEFT JOIN stock ON kode_besar |

**All queries filtered by:** `WHERE is_intercompany = FALSE`

### Period Columns (pre-baked in every mart table)

Each mart table has `period_type` + `period_label` + `period_start`:

| period_type | period_label example | vs_prev (previous period) | vs_ly (last year) |
|---|---|---|---|
| yearly | `2025` | 2024 | same |
| quarterly | `2025-Q4` | 2025-Q3 (QoQ) | 2024-Q4 (YoY) |
| monthly | `2025-12` | 2025-11 (MoM) | 2024-12 (YoY) |
| weekly | `2025-W48` | 2025-W47 (WoW) | 2024-W48 (YoY) |

Standard metric columns per table:
```
revenue, revenue_prev, revenue_prev_pct, revenue_ly, revenue_ly_pct
pairs, pairs_prev, pairs_prev_pct, pairs_ly, pairs_ly_pct
asp, asp_prev, asp_prev_pct, asp_ly, asp_ly_pct
unique_articles
mix_pct
```

---

## Dashboard Pages (4 pages)

### Page 1: National + Channel Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZUMA BUSINESS SNAPSHOT                         [ Branch Filter ▼ ]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LATEST YEAR                                                                │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│  │ REVENUE   │ │  PAIRS    │ │   ASP     │ │ ARTICLES  │                  │
│  │ 216.2 Bn  │ │  1.47M    │ │  84,200   │ │   559     │                  │
│  │ ▲+11% YoY │ │ ▲+8% YoY  │ │ ▲+6% YoY  │ │ +12 YoY   │                  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘                  │
│                                                                             │
│  LATEST QUARTER (same 4 scorecards, QoQ + YoY)                             │
│  LATEST MONTH   (same 4 scorecards, MoM + YoY)                             │
│  LATEST WEEK    (same 4 scorecards, WoW)                                    │
│                                                                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │  MONTHLY REVENUE TREND (Line)    │ │  CHANNEL DONUT + 3-ROW TABLE   │  │
│  │  TY line vs LY line              │ │  RETAIL | NON-RETAIL | EVENT   │  │
│  │  J F M A M J J A S O N D        │ │  Revenue, Pairs, ASP, Mix%     │  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mart tables used:** `mart.sales_national`, `mart.sales_by_channel`

---

### Page 2: Branch + Area

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BRANCH & AREA PERFORMANCE                     [ Branch Filter ▼ ]         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │  REVENUE BY BRANCH (Bar TY/LY)  │ │  BRANCH MIX % (Donut)          │  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  BRANCH TABLE                                                       │   │
│  │  Branch | Rev TY | Rev LY | YoY% | Pairs | ASP | Mix%              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  AREA TABLE                                                         │   │
│  │  Area | Branch | Rev TY | Rev LY | YoY% | Pairs | ASP | Mix%       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  TOP 5 SERIES PER BRANCH (cross-ref)                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mart tables used:** `mart.sales_by_branch`, `mart.sales_by_area`, `mart.top_products_by_place`

---

### Page 3: Store Performance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STORE PERFORMANCE                              [ Branch Filter ▼ ]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │  TOP 10 STORES (Hor. Bar)        │ │  BOTTOM 10 STORES (Hor. Bar)   │  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ALL STORES TABLE (sortable)                                        │   │
│  │  Store|Branch|Area|Cat|Rev TY|Rev LY|YoY%|Pairs|ASP|Uniq Articles  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  TOP 3 SERIES PER STORE (cross-ref)                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mart tables used:** `mart.sales_by_store`, `mart.top_products_by_place`

---

### Page 4: Product Deep Dive

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRODUCT PERFORMANCE                            [ Branch Filter ▼ ]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │  REVENUE BY TIPE (Bar TY/LY)    │ │  REVENUE BY GENDER (Bar TY/LY) │  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │  REVENUE BY TIER (Bar TY/LY)    │ │  MIX % BY GENDER (Donut)       │  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  TOP SERIES TABLE                                                   │   │
│  │  Series|Tipe|Gender|Tier|Rev TY|Rev LY|YoY%|Pairs|Mix%|ASP         │   │
│  │  + Sales:Stock Ratio (sales pairs : current stock pairs)            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  TOP ARTICLES TABLE                                                 │   │
│  │  Article|Series|Gender|Rev TY|Rev LY|YoY%|Pairs|Mix%|ASP           │   │
│  │  + Sales:Stock Ratio (sales pairs : current stock pairs)            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mart tables used:** `mart.sales_by_product`, `mart.sales_by_article`

---

## Mart Tables (8 tables)

### 1. `mart.sales_national`
- **Grain:** period_type × period_label
- **~200 rows**
- **Powers:** Page 1 scorecards + trend line
- **Columns:** period_type, period_label, period_start, revenue, revenue_prev, revenue_prev_pct, revenue_ly, revenue_ly_pct, pairs, pairs_prev, pairs_prev_pct, pairs_ly, pairs_ly_pct, asp, asp_prev, asp_prev_pct, asp_ly, asp_ly_pct, unique_articles

### 2. `mart.sales_by_channel`
- **Grain:** period_type × period_label × store_category
- **~600 rows**
- **Powers:** Page 1 channel donut + table
- **Columns:** + store_category, mix_pct

### 3. `mart.sales_by_branch`
- **Grain:** period_type × period_label × branch
- **~2,000 rows**
- **Powers:** Page 2 branch table + bar + donut
- **Columns:** + branch, mix_pct

### 4. `mart.sales_by_area`
- **Grain:** period_type × period_label × branch × area
- **~3,500 rows**
- **Powers:** Page 2 area table
- **Columns:** + branch, area, mix_pct

### 5. `mart.sales_by_store`
- **Grain:** period_type × period_label × matched_store_name
- **~20,000 rows**
- **Powers:** Page 3 store table + top/bottom bars
- **Columns:** + branch, area, store_category, matched_store_name, mix_pct

### 6. `mart.sales_by_product`
- **Grain:** period_type × period_label × tipe × gender × series × tier
- **~30,000 rows**
- **Powers:** Page 4 product bars + series table
- **Columns:** + tipe, gender, series, tier, mix_pct, current_stock, sales_stock_ratio

### 7. `mart.sales_by_article`
- **Grain:** period_type × period_label × article
- **~50,000 rows**
- **Powers:** Page 4 article table
- **Columns:** + article, series, gender, tier, tipe, mix_pct, current_stock, sales_stock_ratio

### 8. `mart.top_products_by_place`
- **Grain:** period_type × period_label × place_type × place_name × series
- **~100,000 rows**
- **Powers:** Page 2 + 3 cross-ref sections
- **Columns:** place_type ('channel'|'branch'|'store'), place_name, series, revenue, pairs, mix_pct_within_place, rank_within_place

---

## Sales:Stock Ratio

```
Formula:  Sales pairs (in period) : Current Stock pairs
Join:     sales LEFT JOIN public.stock_with_product ON kode_besar
          (sales is LEFT — all sales even if no stock match)
Stock:    SUM(quantity) from public.stock_with_product (latest snapshot_date)
Level:    Series + Article (on product tables only)
Display:  "1:2" format (1 part sales to 2 parts stock)
```

Interpretation:
- 1:0.5 or lower = critically low stock (less than half of period sales)
- 1:1 = stock equals one period of sales (tight)
- 1:2 to 1:4 = healthy
- 1:8+ = overstocked

---

## Intercompany Filter

All mart tables exclude intercompany transactions: `WHERE is_intercompany = FALSE`

See `transaksi-affiliasi.md` for full investigation.

---

## Data Sources

| Source | Schema.Table | Rows | Date Range |
|---|---|---|---|
| Sales | `core.sales_with_product` | 1,471,280 (excl intercompany) | 2022-01 to 2026-02 |
| Stock | `public.stock_with_product` | 142,212 | Daily snapshot (latest) |

---

## Future Additions (when data available)

- [ ] TRX, ATU, ATV — needs iSeller POS integration for real struk/receipt data
- [ ] Margin / Cash Margin — needs trusted accounting data
- [ ] Stock Cover / TO — already exists separately
- [ ] NPS / Member data — needs CRM integration
- [ ] Plan/Target — needs budget data
