export type IpTrustPayload = {
  ip: string;
  isp: string;
  asn: string;
  org: string;
  city: string;
  country: string;
  connectionType: "residential" | "datacenter" | "unknown";
  fraudScore: number;
};

const DATACENTER_KEYWORDS = [
  "hosting",
  "datacenter",
  "data center",
  "cloud",
  "amazon",
  "google",
  "microsoft",
  "digitalocean",
  "linode",
  "vultr",
  "ovh",
  "hetzner",
  "oracle",
  "alibaba",
  "tencent",
  "akamai",
  "fastly",
  "cdn",
  "server",
  "colo",
  "dedicated",
];

function hashIp(ip: string): number {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h * 31 + ip.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Demo fraud score: deterministic per IP, biased low for residential. */
export function computeFraudScore(
  ip: string,
  connectionType: IpTrustPayload["connectionType"],
): number {
  const base = hashIp(ip) % 100;
  if (connectionType === "datacenter") {
    return Math.min(99, 35 + (base % 45));
  }
  if (connectionType === "residential") {
    return base % 10;
  }
  return 10 + (base % 25);
}

export function classifyConnectionType(
  org: string,
  asn: string,
): IpTrustPayload["connectionType"] {
  const blob = `${org} ${asn}`.toLowerCase();
  if (DATACENTER_KEYWORDS.some((k) => blob.includes(k))) {
    return "datacenter";
  }
  if (
    blob.includes("communications") ||
    blob.includes("telecom") ||
    blob.includes("broadband") ||
    blob.includes("cable") ||
    blob.includes("wireless") ||
    blob.includes("mobile") ||
    blob.includes("isp")
  ) {
    return "residential";
  }
  return "unknown";
}

export function parseIpTrustFromIpApi(data: Record<string, unknown>): IpTrustPayload {
  const ip = String(data.ip ?? "—");
  const org = String(data.org ?? data.organisation ?? "Unknown ISP");
  const asn = data.asn ? `AS${data.asn}` : String(data.as ?? "—");
  const isp = org;
  const city = String(data.city ?? "");
  const country = String(data.country_name ?? data.country ?? "");
  const connectionType = classifyConnectionType(org, asn);
  const fraudScore = computeFraudScore(ip, connectionType);

  return {
    ip,
    isp,
    asn,
    org,
    city,
    country,
    connectionType,
    fraudScore,
  };
}

export function fraudRiskLabel(score: number): "safe" | "elevated" | "critical" {
  if (score < 15) return "safe";
  if (score < 50) return "elevated";
  return "critical";
}
