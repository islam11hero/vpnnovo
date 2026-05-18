"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  text: string;
};

export function CopyKeyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600"
    >
      {copied ? (
        <Check className="h-4 w-4 scale-110 transition-transform" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Copy subscription key"}
    </button>
  );
}
