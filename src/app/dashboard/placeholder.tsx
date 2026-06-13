import styles from "./placeholder.module.css";

export function AppPlaceholder({ icon, name, hint }: { icon: React.ReactNode; name: string; hint: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <h2 className={styles.title}>{name}</h2>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
