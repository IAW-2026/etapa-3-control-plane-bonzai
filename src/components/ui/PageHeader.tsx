import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  italic?: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, italic, description, action }: PageHeaderProps) {
  return (
    <header className="mb-10 border-l-2 border-[var(--color-primary)] pl-8 max-md:border-l-0 max-md:border-t-2 max-md:pt-6 max-md:pl-0">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-[2.5rem] font-normal text-[var(--color-primary)] max-md:text-[1.75rem]">
            {title}{" "}
            {italic && <span className="italic text-[var(--color-text-muted)]">{italic}</span>}
          </h1>
          {description && (
            <p className="text-sm text-[var(--color-text-muted)] tracking-wide mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
