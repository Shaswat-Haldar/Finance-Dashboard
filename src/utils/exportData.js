import { sanitizeTransactions } from './transactions'

function escapeCsvField(value) {
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function transactionsToCsv(transactions) {
  const rows = sanitizeTransactions(Array.isArray(transactions) ? transactions : [])
  const headers = ['id', 'date', 'amount', 'category', 'type', 'description']
  const lines = [
    headers.join(','),
    ...rows.map((t) =>
      headers.map((h) => escapeCsvField(t[h])).join(','),
    ),
  ]
  return lines.join('\n')
}

export function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTransactionsJson(transactions) {
  const rows = sanitizeTransactions(Array.isArray(transactions) ? transactions : [])
  downloadBlob(
    `transactions-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(rows, null, 2),
    'application/json',
  )
}

export function exportTransactionsCsv(transactions) {
  downloadBlob(
    `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    transactionsToCsv(transactions),
    'text/csv;charset=utf-8',
  )
}
