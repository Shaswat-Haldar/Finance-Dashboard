export function StickySubNav({ items }) {
  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-[84px] z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1 text-sm text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:text-slate-200"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
