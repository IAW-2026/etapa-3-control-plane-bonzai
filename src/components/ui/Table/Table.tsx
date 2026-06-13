import { createContext, useContext, type ReactNode } from "react";
import styles from "./Table.module.css";

interface HeaderInfo {
  label: string;
  width?: string;
}

interface TableContextValue {
  gridTemplate: string;
  headers: HeaderInfo[];
}

interface TableProps {
  headers: HeaderInfo[];
  children: ReactNode;
  className?: string;
}

const TableContext = createContext<TableContextValue>({
  gridTemplate: "",
  headers: [],
});

export function Table({ headers, children, className }: TableProps) {
  const gridTemplate = headers
    .map((h) => (h.width ? h.width.replace(/([\d.]+)fr/, "minmax(140px, $1fr)") : "minmax(140px, 1fr)"))
    .join(" ");

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <TableContext.Provider value={{ gridTemplate, headers }}>
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
          <div>{children}</div>
        </div>
      </div>
    </TableContext.Provider>
  );
}

interface TableRowProps {
  columns: (string | ReactNode)[];
  onClick?: () => void;
  className?: string;
}

export function TableRow({ columns, onClick, className }: TableRowProps) {
  const { gridTemplate, headers } = useContext(TableContext);

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
      style={{ "--table-cols": gridTemplate } as React.CSSProperties}
      onClick={onClick}
    >
      {columns.map((col, i) => (
        <div key={i} className={styles.cell}>
          <span className={styles.cellLabel}>{headers[i]?.label}</span>
          {col}
        </div>
      ))}
    </div>
  );
}
