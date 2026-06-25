import styles from "./Spinner.module.css";

export function Spinner({ className }: { className?: string }) {
  const classes = [styles.spinner, className].filter(Boolean).join(" ");

  return <div className={classes} />;
}
