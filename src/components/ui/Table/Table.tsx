import { createContext, useContext, type ReactNode } from "react";
import styles from "./Table.module.css";

interface TableProps {
  headers: { label: string; width?: string }[];
  children: ReactNode;
  className?: string;
}

const GridContext = createContext("");

export function Table({ headers, children, className }: TableProps) {
  const gridTemplate = headers
    .map((h) => (h.width ? h.width.replace(/([\d.]+)fr/, "minmax(140px, $1fr)") : "minmax(140px, 1fr)"))
    .join(" ");

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <GridContext.Provider value={gridTemplate}>
      <div className={wrapperClasses}>
        <div className={styles.inner}>
          <div
            className={styles.header}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {headers.map((h, i) => (
              <div key={i} className={styles.headerCell}>
                {h.label}
              </div>
            ))}
          </div>
          <div className={styles.rows}>{children}</div>
        </div>
      </div>
    </GridContext.Provider>
  );
}

interface TableRowProps {
  columns: (string | ReactNode)[];
  onClick?: () => void;
  className?: string;
}

export function TableRow({ columns, onClick, className }: TableRowProps) {
  const gridTemplate = useContext(GridContext);

  const rowClasses = [
    styles.row,
    onClick ? styles.rowClickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClasses}
      style={{ gridTemplateColumns: gridTemplate }}
      onClick={onClick}
    >
      {columns.map((col, i) => (
        <div key={i} className={styles.cell}>
          {col}
        </div>
      ))}
    </div>
  );
}
