interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export function EmptyState({ title = "No data available", hint = "There is nothing to display yet." }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-8 border border-[var(--color-border)]">
      <p className="font-serif text-xl text-[var(--color-text-muted)]">{title}</p>
      <p className="text-sm text-[#aaa] tracking-wide mt-2">{hint}</p>
    </div>
  );
}
