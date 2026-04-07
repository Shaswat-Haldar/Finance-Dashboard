import { useEffect } from 'react'
import { useDashboardStore } from '../store/useDashboardStore'

export function ToastViewport() {
  const toasts = useDashboardStore((s) => s.toasts)
  const dismissToast = useDashboardStore((s) => s.dismissToast)

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 2600),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [toasts, dismissToast])

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.tone === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'border-slate-300 bg-[var(--color-surface-elevated)] text-slate-800 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
