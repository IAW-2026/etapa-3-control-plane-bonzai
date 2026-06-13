import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  headers: { label: string; width?: string }[];
  children: ReactNode;
  className?: string;
}

export function Table({ headers, children, className }: TableProps) {
  const gridTemplate = headers.map((h) => h.width || "1fr").join(" ");

  return (
    <div className={cn("overflow-x-auto border border-[var(--color-border)]", className)}>
      <div style={{ minWidth: 700 }}>
        <div
          className="grid gap-2 px-5 py-3 bg-[rgba(27,61,47,0.02)] border-b border-[var(--color-border)]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {headers.map((h, i) => (
            <div
              key={i}
              className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold"
            >
              {h.label}
            </div>
          ))}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

interface TableRowProps {
  columns: (string | ReactNode)[];
  gridTemplate: string;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ columns, gridTemplate, onClick, className }: TableRowProps) {
  return (
    <div
      className={cn(
        "grid gap-2 px-5 py-3 border-b border-[var(--color-border)] items-center transition-colors duration-200 last:border-b-0",
        onClick && "cursor-pointer hover:bg-[rgba(27,61,47,0.02)]",
        className
      )}
      style={{ gridTemplateColumns: gridTemplate }}
      onClick={onClick}
    >
      {columns.map((col, i) => (
        <div key={i} className="flex items-center text-sm">
          {col}
        </div>
      ))}
    </div>
  );
}
