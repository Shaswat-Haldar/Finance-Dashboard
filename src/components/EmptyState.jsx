export function EmptyState({ title, description, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-6 py-10 text-center dark:bg-slate-800/30 ${className}`}
    >
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  )
}
