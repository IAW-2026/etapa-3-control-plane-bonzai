import styles from "./Badge.module.css";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  children: string;
  className?: string;
}

const variantMap: Record<string, string> = {
  default: styles.default,
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
};

const sizeMap: Record<string, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function Badge({ variant = "default", size = "md", children, className }: BadgeProps) {
  const classes = [styles.badge, variantMap[variant], sizeMap[size], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
