"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-sm font-medium border border-slate-800 bg-slate-950 text-slate-100",
          success: "border-emerald-500/30",
          error: "border-red-500/30",
        },
      }}
    />
  );
}
