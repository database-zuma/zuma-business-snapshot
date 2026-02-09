# Zuma Business Snapshot Dashboard — Technical Roadmap (PoC)

> Built by Sonnet | Data by Opus
> Created: 9 Feb 2026

---

## Why Code Instead of Looker Studio?

- Faster PoC — no drag-and-drop config per chart
- Full control over layout, filters, and period logic
- Mart tables already pre-computed — just fetch and render
- Can iterate faster with code than Looker config

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSR for fast load, API routes for DB queries |
| UI | **React 18** + **Tailwind CSS v3** | Matches existing Zuma projects |
| Charts | **Recharts** | Already used in zuma-branch-superapp |
| Tables | **TanStack Table v8** | Sorting, filtering, pagination out of the box |
| DB Client | **pg** (node-postgres) | Direct PostgreSQL connection to VPS mart tables |
| Hosting | **Vercel** | Existing Zuma deployment platform |
| Auth | None (v1) | Internal tool, add later if needed |

---

## Database Connection

```
Host: 76.13.194.120
Port: 5432
Database: openclaw_ops
User: openclaw_app
Password: (in env vars)
Schema: mart
```

All data comes from pre-computed `mart.*` tables. **No raw SQL aggregation at runtime** — just SELECT from mart tables with optional WHERE filters.

---

## Mart Tables Available (8 tables, all verified)

| Table | Rows | Powers |
|---|---|---|
| `mart.sales_national` | 287 | Page 1: scorecards + trend |
| `mart.sales_by_channel` | 853 | Page 1: channel donut + table |
| `mart.sales_by_branch` | 2,422 | Page 2: branch table + bar + donut |
| `mart.sales_by_area` | 3,594 | Page 2: area table |
| `mart.sales_by_store` | 13,637 | Page 3: store table + top/bottom bars |
| `mart.sales_by_product` | 26,282 | Page 4: product bars + series table |
| `mart.sales_by_article` | 66,894 | Page 4: article table |
| `mart.top_products_by_place` | 15,552 | Page 2+3: cross-ref series per place |

### Common Column Pattern (all tables except top_products_by_place)

```
period_type      -- 'yearly' | 'quarterly' | 'monthly' | 'weekly'
period_label     -- '2025', '2025-Q1', '2025-01', '2025-W01'
period_start     -- date (for sorting)

revenue          -- SUM(total_amount), numeric
revenue_prev     -- previous period revenue
revenue_prev_pct -- % change vs previous period
revenue_ly       -- same period last year revenue
revenue_ly_pct   -- % change vs last year

pairs            -- SUM(quantity), integer
pairs_prev, pairs_prev_pct, pairs_ly, pairs_ly_pct

asp              -- revenue / pairs, numeric
asp_prev, asp_prev_pct, asp_ly, asp_ly_pct

unique_articles  -- COUNT(DISTINCT kode_mix)
mix_pct          -- revenue share of national total (%)
```

### Additional columns per table:

| Table | Extra Columns |
|---|---|
| sales_by_channel | `store_category` (RETAIL, NON-RETAIL, EVENT) |
| sales_by_branch | `branch` |
| sales_by_area | `branch`, `area` |
| sales_by_store | `branch`, `area`, `store_category`, `matched_store_name` |
| sales_by_product | `tipe`, `gender`, `series`, `tier`, `current_stock`, `sales_stock_ratio` |
| sales_by_article | `article`, `series`, `gender`, `tier`, `tipe`, `current_stock`, `sales_stock_ratio` |
| top_products_by_place | `place_type`, `place_name`, `series`, `revenue`, `pairs`, `mix_pct_within_place`, `rank_within_place` |

### Sales:Stock Ratio

```
Format: "1:X" where X = ROUND(current_stock / sales_pairs) — INTEGER only
Example: "1:3" means ~3x stock relative to period sales

Interpretation:
  1:0  = no stock
  1:1  = one period of stock left (cooked)
  1:2 to 1:4 = healthy
  1:8+ = overstocked

Note: stock joined at full grain (tipe × gender × series × tier for product,
      article level for articles). CLASSIC series has multiple genders — each
      combo gets its own stock number.
```

---

## Project Structure

```
zuma-business-snapshot/
├── app/
│   ├── layout.tsx                   -- Root layout with sidebar nav
│   ├── page.tsx                     -- Redirect to /national
│   ├── national/
│   │   └── page.tsx                 -- Page 1: National + Channel
│   ├── branch/
│   │   └── page.tsx                 -- Page 2: Branch + Area
│   ├── store/
│   │   └── page.tsx                 -- Page 3: Store Performance
│   ├── product/
│   │   └── page.tsx                 -- Page 4: Product Deep Dive
│   └── api/
│       ├── national/route.ts        -- GET mart.sales_national
│       ├── channel/route.ts         -- GET mart.sales_by_channel
│       ├── branch/route.ts          -- GET mart.sales_by_branch
│       ├── area/route.ts            -- GET mart.sales_by_area
│       ├── store/route.ts           -- GET mart.sales_by_store
│       ├── product/route.ts         -- GET mart.sales_by_product
│       ├── article/route.ts         -- GET mart.sales_by_article
│       └── top-products/route.ts    -- GET mart.top_products_by_place
├── components/
│   ├── ui/                          -- shadcn/ui components
│   ├── charts/
│   │   ├── BarChartTYvsLY.tsx       -- Grouped bar: TY vs LY
│   │   ├── DonutChart.tsx           -- Mix % donut
│   │   ├── TrendLine.tsx            -- Monthly trend line (TY vs LY)
│   │   └── HorizontalBar.tsx        -- Top/Bottom ranked bars
│   ├── tables/
│   │   ├── DataTable.tsx            -- TanStack Table wrapper (sortable)
│   │   ├── ScoreCard.tsx            -- Single metric card with vs % badge
│   │   └── CrossRefTable.tsx        -- Top products per place
│   ├── filters/
│   │   └── BranchFilter.tsx         -- Global branch multi-select
│   └── layout/
│       ├── Sidebar.tsx              -- Page navigation
│       └── PeriodTabs.tsx           -- Yearly|Quarterly|Monthly|Weekly tabs
├── lib/
│   ├── db.ts                        -- pg Pool connection (singleton)
│   ├── queries.ts                   -- SQL query functions per mart table
│   ├── format.ts                    -- Rp formatter, % formatter, ratio formatter
│   └── types.ts                     -- TypeScript interfaces for all mart rows
├── .env.local                       -- DB credentials (NOT committed)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Page Layouts

### Page 1: National + Channel (`/national`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ZUMA BUSINESS SNAPSHOT                  [ Branch Filter ▼ ]    │
│  [ Yearly | Quarterly | Monthly | Weekly ]  ← period tabs       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ REVENUE  │ │  PAIRS   │ │   ASP    │ │ ARTICLES │           │
│  │ scorecard│ │ scorecard│ │ scorecard│ │ scorecard│           │
│  │ +vs prev │ │ +vs prev │ │ +vs prev │ │          │           │
│  │ +vs ly   │ │ +vs ly   │ │ +vs ly   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐   │
│  │  Monthly Trend (Line)    │ │  Channel Donut (mix_pct)    │   │
│  │  TY line + LY line       │ │  RETAIL | NON-RET | EVENT   │   │
│  └──────────────────────────┘ └─────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Channel Table (3 rows)                                  │   │
│  │  store_category | revenue | rev_ly | yoy% | pairs | asp  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

DATA SOURCE:
  Scorecards → GET /api/national?period_type=monthly (latest row)
  Trend      → GET /api/national?period_type=monthly (all rows, filter TY+LY)
  Channel    → GET /api/channel?period_type=monthly&period_label=LATEST
```

### Page 2: Branch + Area (`/branch`)

```
┌─────────────────────────────────────────────────────────────────┐
│  BRANCH & AREA                           [ Branch Filter ▼ ]    │
│  [ Yearly | Quarterly | Monthly | Weekly ]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐   │
│  │  Branch Bar (TY vs LY)  │ │  Branch Donut (mix_pct)     │   │
│  └──────────────────────────┘ └─────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Branch Table (sortable)                                 │   │
│  │  branch | rev | rev_ly | yoy% | pairs | asp | mix%      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Area Table (sortable)                                   │   │
│  │  area | branch | rev | rev_ly | yoy% | pairs | asp      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Top 5 Series per Branch (cross-ref)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

DATA SOURCE:
  Branch  → GET /api/branch?period_type=monthly&period_label=LATEST
  Area    → GET /api/area?period_type=monthly&period_label=LATEST
  CrossRef→ GET /api/top-products?place_type=branch&period_type=monthly&period_label=LATEST
```

### Page 3: Store Performance (`/store`)

```
┌─────────────────────────────────────────────────────────────────┐
│  STORE PERFORMANCE                       [ Branch Filter ▼ ]    │
│  [ Yearly | Quarterly | Monthly | Weekly ]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐   │
│  │  Top 10 (Hor. Bar)       │ │  Bottom 10 (Hor. Bar)       │   │
│  └──────────────────────────┘ └─────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  All Stores Table (sortable, paginated)                  │   │
│  │  store|branch|area|cat|rev|rev_ly|yoy%|pairs|asp|articles│   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Top 3 Series per Store (cross-ref)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

DATA SOURCE:
  Stores   → GET /api/store?period_type=monthly&period_label=LATEST&branch=ALL
  CrossRef → GET /api/top-products?place_type=store&period_type=monthly&period_label=LATEST
```

### Page 4: Product Deep Dive (`/product`)

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT PERFORMANCE                     [ Branch Filter ▼ ]    │
│  [ Yearly | Quarterly | Monthly | Weekly ]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐   │
│  │  Revenue by Tipe (Bar)   │ │  Revenue by Gender (Bar)    │   │
│  └──────────────────────────┘ └─────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐   │
│  │  Revenue by Tier (Bar)   │ │  Gender Mix % (Donut)       │   │
│  └──────────────────────────┘ └─────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Top Series Table (sortable)                             │   │
│  │  series|tipe|gender|tier|rev|yoy%|pairs|asp|mix%         │   │
│  │  + current_stock | sales_stock_ratio                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Top Articles Table (sortable)                           │   │
│  │  article|series|gender|rev|yoy%|pairs|asp|mix%           │   │
│  │  + current_stock | sales_stock_ratio                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

DATA SOURCE:
  Product → GET /api/product?period_type=monthly&period_label=LATEST
  Article → GET /api/article?period_type=monthly&period_label=LATEST
```

---

## API Route Pattern

Every API route follows the same pattern:

```typescript
// app/api/national/route.ts
import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const periodType = searchParams.get("period_type") || "monthly";
  const periodLabel = searchParams.get("period_label"); // optional, null = all
  const branch = searchParams.get("branch"); // optional, null = all

  let query = `SELECT * FROM mart.sales_national WHERE period_type = $1`;
  const params: any[] = [periodType];

  if (periodLabel) {
    query += ` AND period_label = $${params.length + 1}`;
    params.push(periodLabel);
  }

  query += ` ORDER BY period_start DESC`;

  const { rows } = await pool.query(query, params);
  return NextResponse.json({ success: true, data: rows });
}
```

For branch-filtered tables (channel, branch, area, store, product, article):

```typescript
// Add branch filter for tables that have it
if (branch && branch !== "ALL") {
  query += ` AND branch = $${params.length + 1}`;
  params.push(branch);
}
```

---

## Key Components

### ScoreCard

```typescript
interface ScoreCardProps {
  label: string;           // "Revenue", "Pairs", "ASP"
  value: number;           // 86988538011.66
  vsPrev: number | null;   // -26.6 (%)
  vsPrevLabel: string;     // "MoM" | "QoQ" | "YoY" | "WoW"
  vsLy: number | null;     // 12.5 (%)
  format: "currency" | "number" | "decimal"; // formatting type
}
```

### PeriodTabs

```typescript
// Simple tab selector that changes period_type query param
// Options: Yearly | Quarterly | Monthly | Weekly
// Default: Monthly
// Does NOT add a date picker — periods are pre-baked
```

### BranchFilter

```typescript
// Multi-select dropdown at report level (layout.tsx)
// Options fetched from: SELECT DISTINCT branch FROM mart.sales_by_branch WHERE branch IS NOT NULL
// "All Branches" = no filter = national view
// Persisted via URL searchParam: ?branch=Bali or ?branch=ALL
```

### Format Utilities

```typescript
// lib/format.ts
export function formatRupiah(n: number): string {
  // Rp 86.99 Bn, Rp 5.88 Bn, Rp 84.2 K
}

export function formatPct(n: number | null): string {
  // +12.5%, -4.0%, null → "-"
}

export function formatRatio(ratio: string): { text: string; color: string } {
  // "1:2.8" → { text: "1:2.8", color: "green" }
  // "1:1.0" → { text: "1:1.0", color: "red" }
  // "1:0"   → { text: "1:0", color: "red" }
}
```

---

## Environment Variables (.env.local)

```
DATABASE_URL=postgresql://openclaw_app:Zuma-0psCl4w-2026!@76.13.194.120:5432/openclaw_ops
```

---

## Deployment

| Item | Value |
|---|---|
| GitHub | `database-zuma/zuma-business-snapshot` |
| Vercel | Connected to above repo |
| Account | database-zuma / database@zuma.id |
| Domain | auto-assigned by Vercel (can add custom later) |

---

## Build Phases

### Phase 1: Core (PoC) — TARGET
1. `npm create next-app` with TypeScript + Tailwind + App Router
2. Set up `lib/db.ts` with pg Pool
3. Create all 8 API routes (simple SELECT from mart tables)
4. Build ScoreCard + PeriodTabs + BranchFilter components
5. Build Page 1 (National + Channel) — scorecards, trend line, channel table
6. Build Page 2 (Branch + Area) — bar chart, donut, tables
7. Build Page 3 (Store) — top/bottom bars, full sortable table
8. Build Page 4 (Product) — product bars, series + article tables with sales:stock ratio
9. Deploy to Vercel

### Phase 2: Polish
- Color-coded sales:stock ratio badges (red/yellow/green)
- Conditional formatting on YoY% columns (green positive, red negative)
- Loading skeletons
- Responsive layout (desktop-first, but mobile-usable)
- Export to CSV button per table

### Phase 3: Future (when data available)
- Add TRX, ATU, ATV when iSeller integrated
- Add margin metrics when accounting data trusted
- Add stock cover / TO from existing system
- Add auth if needed for external sharing

---

## Critical Notes for Builder

1. **NO runtime aggregation** — all data is pre-computed in mart tables. Just SELECT and render.
2. **Branch filter** is the ONLY filter. Applied via URL param, passed to API routes.
3. **Period tabs** switch `period_type` param. No date picker.
4. **Sales:Stock ratio** is a TEXT column ("1:3"). Always integers. Parse the number after "1:" for color coding.
5. **Intercompany transactions already excluded** from mart tables. No additional filtering needed.
6. **NULL branches exist** (~276K pairs from MBB online/wholesale). Show as "Unassigned" in UI.
7. **CLASSIC series** spans multiple genders — each tipe×gender×tier combo has its own stock. This is handled correctly in mart tables.
8. **Zuma brand colors**: Primary `#00D084`, Dark `#0D3B2E`, Background `#FFFFFF`
9. **Existing pattern**: Follow zuma-branch-superapp conventions (Recharts, shadcn/ui, Tailwind v3)
