import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  italic?: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, italic, description, action }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div>
          <h1 className={styles.title}>
            {title}{" "}
            {italic && <span className={styles.italic}>{italic}</span>}
          </h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </header>
  );
}
