import { useMemo, useState } from 'react'
import { useDashboardStore } from '../store/useDashboardStore'
import {
  buildTransactionGroups,
  useCategoryOptions,
  useFilteredTransactions,
} from '../hooks/useFilteredTransactions'
import { formatCurrency, formatDate } from '../utils/format'
import { EmptyState } from './EmptyState'
import { ConfirmModal } from './ConfirmModal'

function compareDateStrings(a, b) {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function TransactionsSection() {
  const role = useDashboardStore((s) => s.role)
  const openAddForm = useDashboardStore((s) => s.openAddForm)
  const searchQuery = useDashboardStore((s) => s.searchQuery)
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery)
  const filterCategory = useDashboardStore((s) => s.filterCategory)
  const setFilterCategory = useDashboardStore((s) => s.setFilterCategory)
  const filterType = useDashboardStore((s) => s.filterType)
  const setFilterType = useDashboardStore((s) => s.setFilterType)
  const filterDateFrom = useDashboardStore((s) => s.filterDateFrom)
  const setFilterDateFrom = useDashboardStore((s) => s.setFilterDateFrom)
  const filterDateTo = useDashboardStore((s) => s.filterDateTo)
  const setFilterDateTo = useDashboardStore((s) => s.setFilterDateTo)
  const filterAmountMin = useDashboardStore((s) => s.filterAmountMin)
  const setFilterAmountMin = useDashboardStore((s) => s.setFilterAmountMin)
  const filterAmountMax = useDashboardStore((s) => s.filterAmountMax)
  const setFilterAmountMax = useDashboardStore((s) => s.setFilterAmountMax)
  const groupBy = useDashboardStore((s) => s.groupBy)
  const setGroupBy = useDashboardStore((s) => s.setGroupBy)
  const resetFilters = useDashboardStore((s) => s.resetFilters)
  const sortBy = useDashboardStore((s) => s.sortBy)
  const sortDir = useDashboardStore((s) => s.sortDir)
  const setSort = useDashboardStore((s) => s.setSort)
  const allTransactions = useDashboardStore((s) => s.transactions)

  const filtered = useFilteredTransactions()
  const categories = useCategoryOptions()

  const isAdmin = role === 'admin'

  const dateRangeInvalid =
    Boolean(filterDateFrom.trim() && filterDateTo.trim()) &&
    compareDateStrings(filterDateFrom.trim(), filterDateTo.trim()) > 0

  const fieldBase =
    'w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100'
  const filterSelectClass = `mt-1 ${fieldBase}`

  return (
    <section
      id="transactions"
      className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Advanced filters, grouping, sort, and {isAdmin ? 'manage' : 'review'} your activity
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openAddForm}
            className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            Add transaction
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-[200px] flex-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Search
            </label>
            <input
              type="search"
              placeholder="Description, category, amount…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
            />
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-0 lg:flex-[2]">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={filterSelectClass}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={filterSelectClass}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sort
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value, sortDir)}
                  className={`flex-1 ${fieldBase}`}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
                <button
                  type="button"
                  title={sortDir === 'desc' ? 'Switch to ascending' : 'Switch to descending'}
                  onClick={() => setSort(sortBy, sortDir === 'desc' ? 'asc' : 'desc')}
                  className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-slate-700 transition active:scale-95 hover:border-teal-500/40 dark:text-slate-200"
                >
                  {sortDir === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 dark:bg-slate-800/30">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Advanced filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-teal-700 underline-offset-2 transition hover:underline active:opacity-70 dark:text-teal-400"
            >
              Reset all filters
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Date from
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Date to
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Min amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="No min"
                value={filterAmountMin}
                onChange={(e) => setFilterAmountMin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Max amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="No max"
                value={filterAmountMax}
                onChange={(e) => setFilterAmountMax(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
              />
            </div>
          </div>
          {dateRangeInvalid && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400" role="status">
              &quot;Date from&quot; is after &quot;Date to&quot; — no rows will match until you adjust the range.
            </p>
          )}
        </div>

        <div className="min-w-[180px] max-w-xs">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Group by
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className={filterSelectClass}
          >
            <option value="none">None (flat list)</option>
            <option value="month">Month</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {allTransactions.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No transactions"
          description="Data will appear after the mock API loads, or once you add entries as an admin."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No matches"
          description="Try clearing filters or search to see more transactions."
        />
      ) : (
        <TransactionsDataTable
          key={groupBy}
          filtered={filtered}
          groupBy={groupBy}
          isAdmin={isAdmin}
        />
      )}

      {allTransactions.length > 0 && (
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
          Showing {filtered.length} of {allTransactions.length} transactions
          {groupBy !== 'none' && ` · grouped by ${groupBy}`}
        </p>
      )}

      {!isAdmin && (
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          You are in <strong>Viewer</strong> mode: data is read-only. Switch role to{' '}
          <strong>Admin</strong> in the header to add or edit transactions.
        </p>
      )}
    </section>
  )
}

function TransactionsDataTable({ filtered, groupBy, isAdmin }) {
  const openEditForm = useDashboardStore((s) => s.openEditForm)
  const deleteTransaction = useDashboardStore((s) => s.deleteTransaction)
  const groups = useMemo(
    () => buildTransactionGroups(filtered, groupBy),
    [filtered, groupBy],
  )
  const [collapsed, setCollapsed] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const colCount = isAdmin ? 6 : 5

  const expandAllGroups = () => setCollapsed({})
  const collapseAllGroups = () => {
    const next = {}
    for (const g of groups) {
      if (g.label != null) next[g.key] = true
    }
    setCollapsed(next)
  }

  const toggleGroup = (key) => {
    setCollapsed((c) => ({ ...c, [key]: !c[key] }))
  }

  const renderRow = (t) => (
    <tr
      key={t.id}
      className="border-b border-[var(--color-border-subtle)] transition-colors hover:bg-teal-500/[0.04] dark:hover:bg-teal-500/[0.06]"
    >
      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
        {formatDate(t.date)}
      </td>
      <td className="max-w-[200px] truncate px-4 py-3 text-slate-800 dark:text-slate-100">
        {t.description}
      </td>
      <td className="px-4 py-3">{t.category}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            t.type === 'income'
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
          }`}
        >
          {t.type}
        </span>
      </td>
      <td
        className={`px-4 py-3 text-right font-medium tabular-nums ${
          t.type === 'income'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-slate-800 dark:text-slate-100'
        }`}
      >
        {t.type === 'expense' ? '−' : '+'}
        {formatCurrency(t.amount)}
      </td>
      {isAdmin && (
        <td className="whitespace-nowrap px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => openEditForm(t)}
            className="mr-2 text-teal-600 hover:underline dark:text-teal-400"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(t)}
            className="text-rose-600 hover:underline dark:text-rose-400"
          >
            Delete
          </button>
        </td>
      )}
    </tr>
  )

  return (
    <div className="mt-6">
      <ConfirmModal
        open={pendingDelete != null}
        appLabel="finance-dashboard"
        title="Delete this transaction?"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteTransaction(pendingDelete.id)
          setPendingDelete(null)
        }}
      >
        <p>This action cannot be undone. The following entry will be removed from your dashboard and saved data.</p>
        {pendingDelete && (
          <div className="mt-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-left dark:bg-slate-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {pendingDelete.description}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatDate(pendingDelete.date)} · {pendingDelete.category} ·{' '}
              {pendingDelete.type === 'expense' ? '−' : '+'}
              {formatCurrency(pendingDelete.amount)}
            </p>
          </div>
        )}
      </ConfirmModal>

      {groupBy !== 'none' && (
        <div className="mb-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={expandAllGroups}
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500/40 active:scale-95 dark:text-slate-200"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAllGroups}
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500/40 active:scale-95 dark:text-slate-200"
          >
            Collapse all
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border-subtle)]">
        <table className="min-w-[640px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.key}>
              {group.label != null && (
                <tr className="border-b border-[var(--color-border-subtle)] bg-teal-500/[0.06] dark:bg-teal-950/25">
                  <td colSpan={colCount} className="p-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-semibold text-teal-900 transition hover:bg-teal-500/10 dark:text-teal-100 dark:hover:bg-teal-950/40"
                      aria-expanded={!collapsed[group.key]}
                    >
                      <span>
                        {group.label}
                        <span className="ml-2 font-normal text-slate-600 dark:text-slate-400">
                          ({group.rows.length}{' '}
                          {group.rows.length === 1 ? 'transaction' : 'transactions'})
                        </span>
                      </span>
                      <span className="tabular-nums text-slate-500" aria-hidden>
                        {collapsed[group.key] ? '▶' : '▼'}
                      </span>
                    </button>
                  </td>
                </tr>
              )}
              {(!group.label || !collapsed[group.key]) &&
                group.rows.map((t) => renderRow(t))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  )
}
