export type BrowserIdentityVectors = {
  canvasHash: string;
  webglVendor: string;
  webglRenderer: string;
  audioHash: string;
};

async function hashString(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

export function getCanvasFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 280;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("unavailable");
        return;
      }

      ctx.textBaseline = "top";
      ctx.font = "16px 'Arial'";
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22c55e";
      ctx.fillText("IPNOVA fingerprint probe 🔒", 2, 2);
      ctx.strokeStyle = "#3b82f6";
      ctx.arc(80, 30, 20, 0, Math.PI * 2);
      ctx.stroke();

      const dataUrl = canvas.toDataURL();
      void hashString(dataUrl).then(resolve);
    } catch {
      resolve("unavailable");
    }
  });
}

export function getWebGlFingerprint(): {
  vendor: string;
  renderer: string;
} {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      return { vendor: "unavailable", renderer: "unavailable" };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      return {
        vendor:
          gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)?.toString() ??
          "unknown",
        renderer:
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)?.toString() ??
          "unknown",
      };
    }

    return {
      vendor: gl.getParameter(gl.VENDOR)?.toString() ?? "unknown",
      renderer: gl.getParameter(gl.RENDERER)?.toString() ?? "unknown",
    };
  } catch {
    return { vendor: "unavailable", renderer: "unavailable" };
  }
}

export async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtx) return "unavailable";

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();

    analyser.fftSize = 256;
    gain.gain.value = 0;
    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;

    oscillator.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(0);

    await new Promise((r) => setTimeout(r, 80));

    const bins = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(bins);

    oscillator.stop();
    await ctx.close();

    const sample = Array.from(bins.slice(0, 48))
      .map((v) => v.toFixed(2))
      .join(",");
    return hashString(sample);
  } catch {
    return "unavailable";
  }
}

export async function collectBrowserIdentityVectors(): Promise<BrowserIdentityVectors> {
  const [canvasHash, audioHash] = await Promise.all([
    getCanvasFingerprint(),
    getAudioFingerprint(),
  ]);
  const webgl = getWebGlFingerprint();

  return {
    canvasHash,
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    audioHash,
  };
}
