# finance-dashboard

A responsive **personal finance dashboard** built with React. The application runs entirely in the browser: there is **no backend**. It demonstrates dashboard layout, interactive charts, transaction management with advanced filtering and grouping, simulated role-based access, derived insights, and client-side persistence suitable for a **frontend evaluation** or portfolio piece.

---

## Table of contents

1. [Setup instructions](#1-setup-instructions)  
2. [Overview of approach](#2-overview-of-approach)  
3. [Explanation of features](#3-explanation-of-features)  
4. [Project structure](#4-project-structure)  
5. [Data model & persistence](#5-data-model--persistence)  
6. [Robustness & edge cases](#6-robustness--edge-cases)  
7. [Available scripts](#7-available-scripts)  

---

## 1. Setup instructions

### Prerequisites

- **Node.js** 18+ (LTS recommended)  
- **npm** 9+ (ships with Node)

### Install and run (development)

```bash
cd finance-dashboard
npm install
npm run dev
```

When the dev server starts, open the URL shown in the terminal (typically **http://localhost:5173**).

### Production build

```bash
npm run build
```

Output is written to **`dist/`**. To preview that build locally:

```bash
npm run preview
```

### Quality checks

```bash
npm run lint
```

Runs ESLint across the source tree.

### Common issues

| Issue | Suggestion |
|--------|------------|
| Port already in use | Stop the other process or run Vite with another port: `npm run dev -- --port 5174` |
| `npm install` failures | Clear cache, delete `node_modules`, reinstall; ensure Node version meets prerequisites |
| Blank page after deploy | Ensure the host serves `index.html` for client-side routes (SPA); base path in `vite.config` if deploying under a subpath |

---

## 2. Overview of approach

### Goals

Deliver a **clear, maintainable** dashboard that satisfies core UI requirements (overview, charts, transactions, roles, insights, state) while keeping scope appropriate for a **frontend-only** deliverable.

### Architectural choices

| Concern | Decision | Rationale |
|--------|----------|-----------|
| **UI framework** | React 19 (JavaScript) | Matches the brief; strong ecosystem for forms, tables, and composition. |
| **Build tooling** | Vite 8 | Fast local development and straightforward production bundling. |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Consistent spacing, responsive breakpoints, and a first-class **dark mode** via a class on the document root. |
| **Charts** | Recharts | Declarative chart components for time series and categorical breakdowns without hand-written SVG. |
| **State** | Zustand with `persist` middleware | Single store for transactions, filters, grouping, role, and theme; **partial persistence** to `localStorage` with a **custom merge** so rehydration stays safe. |
| **Data source** | Static seed + **mock API** (`async` + delay) | Simulates loading states and errors without a server; easy to swap for a real API later. |

### Design principles

1. **Validate at the boundary** — Incoming mock data and rehydrated storage are passed through **`sanitizeTransaction` / `sanitizeTransactions`** so charts, filters, and exports never consume malformed rows.  
2. **Pure analytics** — Totals, trends, category rollups, and insight copy live in **`utils/aggregates.js`**, fed by sanitized lists, keeping components thin.  
3. **Separation of concerns** — UI components focus on presentation; **`useFilteredTransactions`** centralizes filter and sort logic; **`buildTransactionGroups`** handles table grouping only.  
4. **Progressive disclosure** — Advanced filters and grouping are grouped in the transactions panel; empty and “no matches” states are explicit.

---

## 3. Explanation of features

### Dashboard overview

- **Summary cards** — Total balance (income minus expenses), total income, and total expenses.  
- **Balance trend** — Area chart of **cumulative net balance** over time by month.  
- **Spending by category** — Donut chart with legend for **expense** totals by category.

### Transactions

- **Columns** — Date, description, category, type (income / expense), amount (signed display for expenses vs income).  
- **Search** — Filters rows by description, category, or amount substring (case-insensitive).  
- **Filters** — Category, transaction type, optional **date range** (from / to), optional **min / max amount**. All active criteria combine with **AND** logic. **Reset all filters** restores defaults.  
- **Sort** — By date, amount, or category, ascending or descending.  
- **Grouping** — View as a flat list, or **group by month** or **by category**, with collapsible section headers, **Expand all**, and **Collapse all**.  
- **Create / update / delete (Admin)** — Modal form for add and edit; **in-app confirmation dialog** (not `window.confirm`) for delete, styled with the rest of the UI.

### Role-based UI (simulated)

- **Viewer** — Read-only: no add, edit, or delete actions; explanatory copy in the transactions section.  
- **Admin** — Full CRUD on transactions via the modal workflow.  
- **Role control** — Dropdown in the header; switching to **Viewer** closes an open transaction form.

### Insights

- **Highest spending category** — Largest expense category by total amount.  
- **Monthly comparison** — Net cash flow compared between the last two months present in the data.  
- **Narrative bullets** — Derived observations (e.g. savings-style ratio, negative balance warning) built from the same aggregates.

### Application chrome

- **Dark / light theme** — Toggle in the header; preference persisted.  
- **Export** — Download all transactions as **CSV** or **JSON** (exported rows are sanitized).  
- **Branding** — Document title and application name use **`finance-dashboard`**; custom **favicon** aligned with the dashboard palette.

### Loading, errors, and demo reset

- **Initial load** — Spinner while the mock API resolves when no transactions are in storage.  
- **API error** — Banner with **Retry** if the mock fetch fails.  
- **Reload demo data** — Re-fetches seed data from the mock API (useful after heavy local edits).

### Enhancements beyond minimum requirements

| Area | Implementation |
|------|----------------|
| Persistence | `localStorage` via Zustand `persist` (transactions, role, theme, filters, sort, grouping). |
| Mock API | Artificial latency in `src/api/mockApi.js`. |
| Advanced table | Date/amount bounds, grouping, collapsible sections. |
| Polish | Focus-visible styles, `aria-*` on dialogs, responsive table scroll, button feedback states. |

---

## 4. Project structure

```
finance-dashboard/
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── api/
    │   └── mockApi.js              # Simulated async fetch
    ├── data/
    │   └── mockTransactions.js     # Seed dataset
    ├── store/
    │   └── useDashboardStore.js    # Global state + persistence merge
    ├── hooks/
    │   └── useFilteredTransactions.js
    ├── utils/
    │   ├── transactions.js         # Validation / sanitization / dedupe
    │   ├── format.js               # Dates, currency, month keys
    │   ├── aggregates.js           # KPIs, chart series, insights
    │   └── exportData.js           # CSV / JSON download
    └── components/
        ├── Header.jsx
        ├── SummaryCards.jsx
        ├── BalanceTrendChart.jsx
        ├── SpendingBreakdown.jsx
        ├── InsightsPanel.jsx
        ├── TransactionsSection.jsx # Filters, grouping, table
        ├── TransactionFormModal.jsx
        ├── ConfirmModal.jsx        # Delete confirmation
        └── EmptyState.jsx
```

---

## 5. Data model & persistence

### Transaction record

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Unique identifier. |
| `date` | string | `YYYY-MM-DD`. |
| `amount` | number | Non-negative; sign implied by `type`. |
| `category` | string | Non-empty after trim. |
| `type` | `"income"` \| `"expense"` | Drives styling and aggregates. |
| `description` | string | Free text. |

### What is persisted

The store **partializes** persistence to: transactions, role, theme, search string, category/type filters, date and amount bounds, sort fields, and grouping mode. **Modal open state** and **API flags** are not persisted.

Rehydration uses a **custom `merge`** that clamps enums (e.g. role, theme, `groupBy`) and **re-sanitizes** transaction arrays.

---

## 6. Robustness & edge cases

- **Corrupt or unavailable `localStorage`** — Wrapped in try/catch; failed writes do not crash the app.  
- **Invalid persisted transactions** — Dropped during sanitization; duplicate `id` values deduplicated.  
- **Invalid dates** — Safe parsing; invalid values excluded from trends or labeled **Unknown date** in grouping.  
- **Non-finite amounts** — Rejected in validation; **—** shown in currency formatting when needed.  
- **Exports** — Only sanitized rows; CSV fields quoted when necessary to avoid injection in spreadsheet tools.

*(Automated unit tests for `aggregates` and `transactions` utilities are a logical next step but are not included in this repository.)*

---

## 7. Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally for smoke testing. |
| `npm run lint` | Run ESLint on the project source files. |

---

## License & use

This repository is intended for **evaluation / portfolio** purposes unless otherwise specified by the author.
