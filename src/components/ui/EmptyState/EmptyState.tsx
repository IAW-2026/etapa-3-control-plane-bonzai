import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export function EmptyState({ title = "No data available", hint = "There is nothing to display yet." }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{title}</p>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
