import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  variant?: "shadow" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const variantMap: Record<string, string> = {
  shadow: styles.shadow,
  flat: "",
};

const paddingMap: Record<string, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export function Card({ variant = "shadow", padding = "md", className, children }: CardProps) {
  const classes = [styles.card, variantMap[variant], paddingMap[padding], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.headerContent}>
        <h2 className={styles.headerTitle}>{title}</h2>
        {description && <p className={styles.headerDescription}>{description}</p>}
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
}
