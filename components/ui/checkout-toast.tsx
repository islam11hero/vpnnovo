"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export type CheckoutToastVariant = "error" | "success";

type Props = {
  message: string | null;
  variant?: CheckoutToastVariant;
  onDismiss?: () => void;
};

export function CheckoutToast({
  message,
  variant = "error",
  onDismiss,
}: Props) {
  const isError = variant === "error";

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mx-auto mb-8 max-w-2xl"
          role="alert"
        >
          <motion.div
            className={`flex items-start gap-3 rounded-xl border px-4 py-4 shadow-lg backdrop-blur-sm ${
              isError
                ? "border-red-500/40 bg-red-950/90 text-red-100 shadow-red-500/10"
                : "border-emerald-500/40 bg-emerald-950/90 text-emerald-100 shadow-emerald-500/10"
            }`}
          >
            {isError ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            )}
            <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 rounded-lg p-1 opacity-70 transition hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
