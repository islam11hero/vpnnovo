"use client";

import { X } from "lucide-react";

import {
  ClientHandoffPanel,
  type ClientHandoffPanelProps,
} from "@/components/admin/clients/client-handoff-panel";

type Props = ClientHandoffPanelProps & {
  open: boolean;
  onClose: () => void;
  title?: string;
};

export function ClientHandoffDialog({
  open,
  onClose,
  title = "Client handoff",
  ...handoff
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close handoff"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-poppins text-lg font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ClientHandoffPanel {...handoff} />
      </div>
    </div>
  );
}
