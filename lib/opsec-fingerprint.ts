import { getCanvasFingerprint } from "@/lib/browser-fingerprint";

const ANTIDETECT_UA_MARKERS = [
  "adspower",
  "dolphin",
  "anty",
  "gologin",
  "multilogin",
  "sunbrowser",
  "incogniton",
  "undetectable",
  "morelogin",
];

export type FingerprintAudit = {
  isAntiDetectBrowser: boolean;
  canvasSpoofingActive: boolean;
  tlsJa4Label: string;
  canvasHash: string;
  warning: string | null;
};

export function isAntiDetectUserAgent(ua: string): boolean {
  const lower = ua.toLowerCase();
  return ANTIDETECT_UA_MARKERS.some((m) => lower.includes(m));
}

function inferJa4Label(ua: string, antiDetect: boolean): string {
  const lower = ua.toLowerCase();
  if (antiDetect) {
    if (lower.includes("chrome")) return "Synthetic Chrome (Anty Profile)";
    if (lower.includes("firefox")) return "Synthetic Firefox (Anty Profile)";
    return "Synthetic TLS Stack (Anty Profile)";
  }
  if (lower.includes("edg/")) return "Organic Edge";
  if (lower.includes("chrome") && !lower.includes("chromium")) {
    return "Organic Chrome";
  }
  if (lower.includes("firefox")) return "Organic Firefox";
  if (lower.includes("safari") && !lower.includes("chrome")) {
    return "Organic Safari";
  }
  return "Unknown TLS Client";
}

export async function runFingerprintAudit(): Promise<FingerprintAudit> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const antiDetect = isAntiDetectUserAgent(ua);

  const [canvasA, canvasB] = await Promise.all([
    getCanvasFingerprint(),
    getCanvasFingerprint(),
  ]);

  const canvasSpoofingActive =
    canvasA !== "unavailable" &&
    canvasB !== "unavailable" &&
    canvasA !== canvasB;

  const tlsJa4Label = inferJa4Label(ua, antiDetect);

  let warning: string | null = null;
  if (!antiDetect && !canvasSpoofingActive) {
    warning =
      "Standard Browser Detected. Use AdsPower or Dolphin Anty for Media Buying to prevent Canvas detection.";
  }

  return {
    isAntiDetectBrowser: antiDetect,
    canvasSpoofingActive: canvasSpoofingActive || antiDetect,
    tlsJa4Label,
    canvasHash: canvasA,
    warning,
  };
}
