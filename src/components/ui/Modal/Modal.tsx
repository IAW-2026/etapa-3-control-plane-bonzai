"use client";

import { useEffect, type ReactNode } from "react";
import styles from "./Modal.module.css";

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

  const dialogClasses = [styles.dialog, className].filter(Boolean).join(" ");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={dialogClasses} onClick={(e) => e.stopPropagation()}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && <p className={styles.description}>{description}</p>}
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
