import { buildAdsPowerProxyLine } from "@/lib/opsec-export";

export type ProxyExtractSource =
  | "socks5"
  | "http"
  | "subscription"
  | "synthetic";

export type AdsPowerProxyResult = {
  line: string;
  source: ProxyExtractSource;
  protocolLabel: string;
};

type ParsedEndpoint = {
  host: string;
  port: number;
  username: string;
  password: string;
};

function toAdsPowerLine(endpoint: ParsedEndpoint): string {
  return `${endpoint.host}:${endpoint.port}:${endpoint.username}:${endpoint.password}`;
}

function parseProxyUrl(raw: string): ParsedEndpoint | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname;
    const port = url.port
      ? Number(url.port)
      : url.protocol === "https:"
        ? 443
        : url.protocol === "http:"
          ? 80
          : 1080;
    if (!host || !Number.isFinite(port)) return null;

    const username = decodeURIComponent(url.username || "");
    const password = decodeURIComponent(url.password || "");
    if (!username) return null;

    return {
      host,
      port,
      username,
      password: password || username,
    };
  } catch {
    return null;
  }
}

function pickLink(
  links: string[],
  protocols: string[],
): ParsedEndpoint | null {
  for (const protocol of protocols) {
    const match = links.find((link) =>
      link.toLowerCase().startsWith(`${protocol}:`),
    );
    if (!match) continue;
    const parsed = parseProxyUrl(match);
    if (parsed) return parsed;
  }
  return null;
}

/**
 * Extract AdsPower `IP:Port:User:Pass` from Marzban `links` / subscription URL.
 */
export function extractAdsPowerProxy(input: {
  links?: string[];
  subscriptionUrl?: string | null;
  vpnUsername?: string;
}): AdsPowerProxyResult {
  const links = input.links ?? [];
  const subscriptionUrl = input.subscriptionUrl?.trim() ?? "";
  const vpnUsername = input.vpnUsername?.trim() ?? "";

  const socks = pickLink(links, ["socks5", "socks"]);
  if (socks) {
    return {
      line: toAdsPowerLine(socks),
      source: "socks5",
      protocolLabel: "SOCKS5",
    };
  }

  const http = pickLink(links, ["http", "https"]);
  if (http) {
    return {
      line: toAdsPowerLine(http),
      source: "http",
      protocolLabel: "HTTP",
    };
  }

  if (subscriptionUrl) {
    return {
      line: subscriptionUrl,
      source: "subscription",
      protocolLabel: "Subscription URL",
    };
  }

  return {
    line: buildAdsPowerProxyLine(subscriptionUrl, vpnUsername),
    source: "synthetic",
    protocolLabel: "Host template",
  };
}
