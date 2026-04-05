import { useMemo } from 'react'
import { useDashboardStore } from '../store/useDashboardStore'
import { monthKey, monthLabel } from '../utils/format'
import { sanitizeTransactions } from '../utils/transactions'

function compareDateStrings(a, b) {
  if (a === b) return 0
  return a < b ? -1 : 1
}

/** Filters + sorts; only includes structurally valid transactions. */
export function useFilteredTransactions() {
  const transactions = useDashboardStore((s) => s.transactions)
  const searchQuery = useDashboardStore((s) => s.searchQuery)
  const filterCategory = useDashboardStore((s) => s.filterCategory)
  const filterType = useDashboardStore((s) => s.filterType)
  const filterDateFrom = useDashboardStore((s) => s.filterDateFrom)
  const filterDateTo = useDashboardStore((s) => s.filterDateTo)
  const filterAmountMin = useDashboardStore((s) => s.filterAmountMin)
  const filterAmountMax = useDashboardStore((s) => s.filterAmountMax)
  const sortBy = useDashboardStore((s) => s.sortBy)
  const sortDir = useDashboardStore((s) => s.sortDir)

  return useMemo(() => {
    const safe = sanitizeTransactions(transactions)
    const q = searchQuery.trim().toLowerCase()

    const minRaw = filterAmountMin.trim()
    const maxRaw = filterAmountMax.trim()
    const minAmt = minRaw === '' ? null : Number(minRaw)
    const maxAmt = maxRaw === '' ? null : Number(maxRaw)
    const hasMin = minAmt != null && Number.isFinite(minAmt)
    const hasMax = maxAmt != null && Number.isFinite(maxAmt)

    const from = filterDateFrom.trim()
    const to = filterDateTo.trim()

    let list = safe.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterCategory !== 'all' && t.category !== filterCategory) return false

      if (from && compareDateStrings(t.date, from) < 0) return false
      if (to && compareDateStrings(t.date, to) > 0) return false

      if (hasMin && t.amount < minAmt) return false
      if (hasMax && t.amount > maxAmt) return false

      if (!q) return true
      const desc = (t.description ?? '').toLowerCase()
      const cat = (t.category ?? '').toLowerCase()
      return (
        desc.includes(q) ||
        cat.includes(q) ||
        String(t.amount).includes(q)
      )
    })

    const mult = sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      if (sortBy === 'amount') return (a.amount - b.amount) * mult
      if (sortBy === 'category')
        return String(a.category).localeCompare(String(b.category)) * mult
      return compareDateStrings(a.date, b.date) * mult
    })

    return list
  }, [
    transactions,
    searchQuery,
    filterCategory,
    filterType,
    filterDateFrom,
    filterDateTo,
    filterAmountMin,
    filterAmountMax,
    sortBy,
    sortDir,
  ])
}

export function useCategoryOptions() {
  const transactions = useDashboardStore((s) => s.transactions)
  return useMemo(() => {
    const set = new Set()
    for (const t of sanitizeTransactions(transactions)) {
      set.add(t.category)
    }
    return [...set].sort()
  }, [transactions])
}

/** @param {'none'|'month'|'category'} groupBy */
export function buildTransactionGroups(filtered, groupBy) {
  if (!Array.isArray(filtered) || groupBy === 'none') {
    return [{ key: '_all', label: null, rows: filtered }]
  }

  if (groupBy === 'category') {
    const map = new Map()
    for (const t of filtered) {
      const k = t.category || 'Uncategorized'
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(t)
    }
    const keys = [...map.keys()].sort((a, b) => a.localeCompare(b))
    return keys.map((k) => ({
      key: `cat:${k}`,
      label: k,
      rows: map.get(k),
    }))
  }

  /* month */
  const map = new Map()
  for (const t of filtered) {
    const mk = monthKey(t.date)
    const k = mk ?? 'unknown'
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(t)
  }
  const keys = [...map.keys()].filter((k) => k !== 'unknown').sort()
  const unknown = map.get('unknown')
  const ordered = []
  for (const k of keys) {
    ordered.push({
      key: `mo:${k}`,
      label: monthLabel(k),
      rows: map.get(k),
    })
  }
  if (unknown?.length) {
    ordered.push({
      key: 'mo:unknown',
      label: 'Unknown date',
      rows: unknown,
    })
  }
  return ordered
}
