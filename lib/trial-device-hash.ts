/** Stealth client fingerprint for trial anti-abuse (browser-only). */

function getBasicCanvasSample(): string {
  if (typeof document === "undefined") return "ssr";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-ctx";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22c55e";
    ctx.fillText("ipnova-trial-probe", 2, 2);
    return canvas.toDataURL();
  } catch {
    return "canvas-blocked";
  }
}

async function digestHex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/**
 * Hash of userAgent + screen metrics + basic canvas text.
 * Sent with trial checkout to dedupe devices behind NAT.
 */
export async function generateTrialDeviceHash(): Promise<string> {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return "unavailable";
  }

  const ua = navigator.userAgent;
  const screenSig = [
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    window.devicePixelRatio,
  ].join("x");

  const canvasPart = getBasicCanvasSample();
  return digestHex(`${ua}|${screenSig}|${canvasPart}`);
}
