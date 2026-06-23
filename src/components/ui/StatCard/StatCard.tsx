import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  warning?: boolean;
  className?: string;
}

export function StatCard({ icon, value, label, warning, className }: StatCardProps) {
  const cardClasses = [styles.card, warning ? styles.cardWarning : "", className]
    .filter(Boolean)
    .join(" ");

  const iconClasses = [styles.icon, warning ? styles.iconWarning : styles.iconDefault]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      <div className={iconClasses}>
        {icon}
      </div>
      <div className={styles.textGroup}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
