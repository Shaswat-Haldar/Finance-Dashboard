import { useEffect, useState } from 'react'
import { useDashboardStore } from '../store/useDashboardStore'

const defaultForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  category: '',
  type: 'expense',
  description: '',
})

function formFromEditing(editing) {
  if (!editing) return defaultForm()
  return {
    date: editing.date,
    amount: String(editing.amount),
    category: editing.category,
    type: editing.type,
    description: editing.description,
  }
}

/** Remounted when `editing` identity changes so form state stays in sync without effects. */
function TransactionFormModalContent({ editing, onClose }) {
  const addTransaction = useDashboardStore((s) => s.addTransaction)
  const updateTransaction = useDashboardStore((s) => s.updateTransaction)

  const [form, setForm] = useState(() => formFromEditing(editing))
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const amountNum = Number(form.amount)
    if (!form.date || !form.category.trim() || !form.description.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number.')
      return
    }
    setError('')
    if (editing) {
      updateTransaction(editing.id, { ...form, amount: amountNum })
    } else {
      addTransaction({ ...form, amount: amountNum })
    }
    onClose()
  }

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-xl transition-all duration-200">
      <h2 id="tx-form-title" className="text-lg font-semibold">
        {editing ? 'Edit transaction' : 'Add transaction'}
      </h2>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Date
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Amount (USD)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Category
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Food"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Description
          </label>
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-100"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function TransactionFormModal() {
  const formOpen = useDashboardStore((s) => s.formOpen)
  const editing = useDashboardStore((s) => s.editingTransaction)
  const closeForm = useDashboardStore((s) => s.closeForm)

  useEffect(() => {
    if (!formOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeForm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formOpen, closeForm])

  if (!formOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={closeForm}
      />
      <TransactionFormModalContent
        key={editing ? editing.id : 'new'}
        editing={editing}
        onClose={closeForm}
      />
    </div>
  )
}
