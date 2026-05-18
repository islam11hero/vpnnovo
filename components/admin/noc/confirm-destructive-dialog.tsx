"use client";

import { Loader2 } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  locked?: boolean;
  lockedMessage?: string;
};

export function ConfirmDestructiveDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  pending = false,
  locked = false,
  lockedMessage,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      description={description}
      variant="destructive"
    >
      {locked && lockedMessage ? (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          {lockedMessage}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending || locked}
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
