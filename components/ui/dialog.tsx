"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "destructive";
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "default",
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-0 z-[100] m-auto w-[min(100%,28rem)] max-h-[90vh] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-0 text-slate-100 shadow-2xl backdrop:bg-black/70 open:flex open:flex-col"
    >
      <div
        className={`border-b px-6 py-5 ${
          variant === "destructive"
            ? "border-red-500/30 bg-red-950/20"
            : "border-slate-800 bg-slate-900/50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto px-6 py-5">{children}</div>
    </dialog>
  );
}
