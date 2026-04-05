/**
 * Normalizes and validates transaction records so malformed or persisted
 * data cannot break filters, charts, or exports.
 */

export function isValidTransaction(t) {
  if (!t || typeof t !== 'object') return false
  if (typeof t.id !== 'string' || t.id.length === 0) return false
  if (typeof t.date !== 'string' || t.date.length < 8) return false
  const amount = Number(t.amount)
  if (!Number.isFinite(amount) || amount < 0) return false
  if (typeof t.category !== 'string' || t.category.trim() === '') return false
  if (t.type !== 'income' && t.type !== 'expense') return false
  if (typeof t.description !== 'string') return false
  return true
}

/** Returns a safe copy or null if invalid. */
export function sanitizeTransaction(t) {
  if (!isValidTransaction(t)) return null
  return {
    id: String(t.id),
    date: String(t.date).slice(0, 10),
    amount: Number(t.amount),
    category: String(t.category).trim(),
    type: t.type,
    description: String(t.description).trim(),
  }
}

export function sanitizeTransactions(list) {
  if (!Array.isArray(list)) return []
  const out = []
  for (const item of list) {
    const s = sanitizeTransaction(item)
    if (s) out.push(s)
  }
  return out
}

/** De-duplicate by id (keeps first occurrence). */
export function dedupeById(list) {
  const seen = new Set()
  return list.filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

export function normalizeImportedTransactions(list) {
  return dedupeById(sanitizeTransactions(list))
}
