"use client";

import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, Crown, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { provisionFreeVipClientAction } from "@/actions/admin-vip-provision";
import { ClientHandoffPanel } from "@/components/admin/clients/client-handoff-panel";
import { validateMarzbanUsername } from "@/lib/marzban-validation";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type SuccessData = {
  accessCode: string;
  subLink: string;
  username: string;
  message: string;
  portalLink: string;
};

export function CreateVipDialog({ open, onClose, onCreated }: Props) {
  const [username, setUsername] = useState("");
  const [months, setMonths] = useState(1);
  const [dataLimitGb, setDataLimitGb] = useState(100);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const resetForm = () => {
    setUsername("");
    setMonths(1);
    setDataLimitGb(100);
    setSuccessData(null);
    setFormError(null);
  };

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateMarzbanUsername(username);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await provisionFreeVipClientAction({
        username: username.trim(),
        months,
        dataLimitGb,
      });

      if (!result.success) {
        const errorMessage =
          "error" in result
            ? result.error
            : "Marzban or Supabase rejected the request.";
        setFormError(errorMessage);
        toast.error("VIP provisioning failed", {
          description: errorMessage,
        });
        return;
      }

      if (!result.data) {
        setFormError("Provisioning succeeded but returned no handoff payload.");
        return;
      }

      setSuccessData({
        accessCode: result.data.accessCode,
        subLink: result.data.subLink,
        username: result.data.username,
        message: result.data.message,
        portalLink: result.data.portalLink,
      });
      onCreated();
      toast.success(result.data.message, {
        description: "Order ID, QR, and links are ready below.",
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
              <Crown className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-poppins text-xl font-bold text-white">
                Free VIP Client Provisioning
              </h2>
              <p className="text-xs text-slate-500">
                Marzban + Supabase · $0.00 revenue · instant handoff
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successData ? (
          <div className="space-y-4">
            <ClientHandoffPanel
              accessCode={successData.accessCode}
              username={successData.username}
              subLink={successData.subLink}
              portalLink={successData.portalLink}
              message={successData.message}
            />
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl border border-slate-700 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p className="font-medium">{formError}</p>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="vip-username"
                className="mb-1 block text-xs font-bold tracking-widest text-slate-500 uppercase"
              >
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="vip-username"
                type="text"
                required
                autoComplete="off"
                spellCheck={false}
                placeholder="Ahmed_VIP"
                value={username}
                onChange={(e) => {
                  setFormError(null);
                  setUsername(e.target.value.replace(/\s/g, ""));
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="mt-1.5 text-[11px] text-slate-600">
                No spaces · 3–64 chars · letters, numbers, _ . -
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
              <p className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
                Plan
              </p>
              <p className="mt-1 text-sm font-bold text-white">VIP Free Trial</p>
              <p className="text-xs text-slate-500">Billed at $0.00 — excluded from MRR</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vip-months"
                  className="mb-1 block text-xs font-bold tracking-widest text-slate-500 uppercase"
                >
                  Duration (months)
                </label>
                <input
                  id="vip-months"
                  type="number"
                  min={1}
                  max={120}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="vip-gb"
                  className="mb-1 block text-xs font-bold tracking-widest text-slate-500 uppercase"
                >
                  Data cap (GB)
                </label>
                <input
                  id="vip-gb"
                  type="number"
                  min={0}
                  max={10000}
                  value={dataLimitGb}
                  onChange={(e) => setDataLimitGb(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !username.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              {isPending ? "Provisioning…" : "Provision Free VIP Client"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
