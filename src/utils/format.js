export function parseISODate(isoDate) {
  if (isoDate == null || typeof isoDate !== 'string') return null
  const s = isoDate.trim()
  if (s.length < 8) return null
  const d = new Date(s.includes('T') ? s : `${s}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(isoDate) {
  const d = parseISODate(isoDate)
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function monthKey(isoDate) {
  const d = parseISODate(isoDate)
  if (!d) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  if (key == null || key === 'unknown' || typeof key !== 'string') return 'Unknown period'
  const parts = key.split('-').map(Number)
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return 'Unknown period'
  const [y, m] = parts
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(y, m - 1, 1),
  )
}
