"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, actions, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white border border-[var(--color-border)] p-8 w-full max-w-sm flex flex-col gap-4",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="font-serif text-xl font-medium text-[var(--color-primary)]">{title}</h3>}
        {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
        {children}
        {actions && <div className="flex gap-3 justify-end mt-2">{actions}</div>}
      </div>
    </div>
  );
}
