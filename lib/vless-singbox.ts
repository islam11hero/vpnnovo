import "server-only";

/**
 * Build minimal sing-box JSON when Marzban returns base64 VLESS URI list
 * instead of sing-box subscription JSON.
 */
export function buildSingboxConfigFromVlessUri(uri: string): Record<string, unknown> {
  const parsed = parseVlessUri(uri.trim());
  if (!parsed) {
    throw new Error("Could not parse VLESS link");
  }

  const outbound: Record<string, unknown> = {
    type: "vless",
    tag: "proxy",
    server: parsed.host,
    server_port: parsed.port,
    uuid: parsed.uuid,
    packet_encoding: "xudp",
  };

  if (parsed.flow) {
    outbound.flow = parsed.flow;
  }

  if (parsed.security === "reality") {
    outbound.tls = {
      enabled: true,
      server_name: parsed.sni || parsed.host,
      reality: {
        enabled: true,
        public_key: parsed.pbk ?? "",
        short_id: parsed.sid ?? "",
      },
      utls: {
        enabled: true,
        fingerprint: parsed.fp || "chrome",
      },
    };
  } else if (parsed.security === "tls") {
    outbound.tls = {
      enabled: true,
      server_name: parsed.sni || parsed.host,
      utls: {
        enabled: true,
        fingerprint: parsed.fp || "chrome",
      },
    };
  }

  if (parsed.type === "grpc" && parsed.serviceName) {
    outbound.transport = {
      type: "grpc",
      service_name: parsed.serviceName,
    };
  } else if (parsed.type === "ws") {
    outbound.transport = {
      type: "ws",
      path: parsed.path || "/",
      headers: parsed.hostHeader ? { Host: parsed.hostHeader } : undefined,
    };
  }

  return {
    log: { level: "info" },
    dns: {
      servers: [
        { tag: "dns-remote", address: "8.8.8.8", detour: "proxy" },
        { tag: "dns-local", address: "local", detour: "direct" },
      ],
      rules: [{ outbound: "any", server: "dns-remote" }],
      final: "dns-remote",
    },
    outbounds: [
      outbound,
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" },
    ],
    route: {
      rules: [
        { action: "sniff" },
        { protocol: "quic", action: "reject" },
        { ip_is_private: true, outbound: "direct" },
      ],
      final: "proxy",
      auto_detect_interface: true,
    },
  };
}

type ParsedVless = {
  uuid: string;
  host: string;
  port: number;
  security?: string;
  type?: string;
  sni?: string;
  fp?: string;
  pbk?: string;
  sid?: string;
  flow?: string;
  path?: string;
  serviceName?: string;
  hostHeader?: string;
};

function parseVlessUri(uri: string): ParsedVless | null {
  if (!uri.startsWith("vless://")) return null;

  try {
    const url = new URL(uri);
    const uuid = decodeURIComponent(url.username);
    const host = url.hostname;
    const port = url.port ? Number(url.port) : 443;
    if (!uuid || !host) return null;

    const q = url.searchParams;
    return {
      uuid,
      host,
      port,
      security: q.get("security") ?? undefined,
      type: q.get("type") ?? "tcp",
      sni: q.get("sni") ?? undefined,
      fp: q.get("fp") ?? undefined,
      pbk: q.get("pbk") ?? undefined,
      sid: q.get("sid") ?? undefined,
      flow: q.get("flow") ?? undefined,
      path: q.get("path") ?? undefined,
      serviceName: q.get("serviceName") ?? q.get("service_name") ?? undefined,
      hostHeader: q.get("host") ?? undefined,
    };
  } catch {
    return null;
  }
}

export function extractVlessUriFromSubscription(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("vless://")) return trimmed.split(/\s/)[0] ?? null;

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    const line = decoded
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.startsWith("vless://"));
    if (line) return line;
  } catch {
    /* ignore */
  }

  const inline = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith("vless://"));
  return inline ?? null;
}
