export type SecurityScanResult = {
  webrtcLeak: boolean;
  webrtcLocalIps: string[];
  ipv6Leak: boolean;
  ipv6Address: string | null;
};

const PRIVATE_IPV4_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
];

export function isPrivateIpv4(ip: string): boolean {
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(ip));
}

function extractIpv4FromIceCandidate(candidate: string): string[] {
  const matches = candidate.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g);
  return matches ?? [];
}

/** Probe WebRTC ICE candidates for exposed LAN/private IPs. */
export async function detectWebRtcLeak(): Promise<{
  leaked: boolean;
  localIps: string[];
}> {
  if (typeof window === "undefined" || typeof RTCPeerConnection === "undefined") {
    return { leaked: false, localIps: [] };
  }

  return new Promise((resolve) => {
    const localIps = new Set<string>();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        pc.close();
      } catch {
        /* already closed */
      }
      const leakedIps = Array.from(localIps).filter(isPrivateIpv4);
      resolve({ leaked: leakedIps.length > 0, localIps: leakedIps });
    };

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const timeout = setTimeout(finish, 4500);

    pc.onicecandidate = (event) => {
      if (!event.candidate?.candidate) return;
      for (const ip of extractIpv4FromIceCandidate(event.candidate.candidate)) {
        if (isPrivateIpv4(ip)) localIps.add(ip);
      }
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") finish();
    };

    try {
      pc.createDataChannel("ipnova-security-audit");
      pc
        .createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish());
    } catch {
      finish();
    }
  });
}

/** IPv6-only endpoint — success implies IPv6 route is active (FB Ads risk). */
export async function detectIpv6Leak(): Promise<{
  leaked: boolean;
  ipv6Address: string | null;
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api64.ipify.org?format=json", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { leaked: false, ipv6Address: null };
    }

    const data = (await res.json()) as { ip?: string };
    const ip = data.ip?.trim() ?? "";

    return { leaked: true, ipv6Address: ip || "IPv6 route active" };
  } catch {
    return { leaked: false, ipv6Address: null };
  }
}

export async function runSecurityScan(): Promise<SecurityScanResult> {
  const [webrtc, ipv6] = await Promise.all([
    detectWebRtcLeak(),
    detectIpv6Leak(),
  ]);

  return {
    webrtcLeak: webrtc.leaked,
    webrtcLocalIps: webrtc.localIps,
    ipv6Leak: ipv6.leaked,
    ipv6Address: ipv6.ipv6Address,
  };
}
