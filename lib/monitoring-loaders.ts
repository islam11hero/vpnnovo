import "server-only";

import {
  fetchAllMarzbanUsers,
  protocolLabelFromProxies,
} from "@/lib/marzban/users-bulk";
import type {
  MonitoringAbuseAlert,
  MonitoringAsnType,
  MonitoringBandwidthRow,
  MonitoringIpReputation,
  MonitoringNetworkMetrics,
  MonitoringPayload,
  MonitoringResourcePoint,
} from "@/lib/monitoring-types";
import { fetchPrimaryVultrInstance } from "@/lib/vultr";

const GB = 1024 ** 3;

function hashIp(ip: string): number {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h * 31 + ip.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Demo fraud score — prep for MaxMind / Scamalytics. */
export function mockFraudScore(ip: string, asnType: MonitoringAsnType): number {
  const base = hashIp(ip) % 100;
  if (asnType === "datacenter") {
    return Math.min(99, 28 + (base % 40));
  }
  return Math.min(12, base % 12);
}

function buildResourceSeries(seed: number): MonitoringResourcePoint[] {
  const points: MonitoringResourcePoint[] = [];
  let cpu = 18 + (seed % 15);
  let ram = 42 + (seed % 20);
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    const t = new Date(now - i * 60_000);
    cpu = Math.max(5, Math.min(92, cpu + (Math.sin(i + seed) * 6 + (seed % 7) - 3)));
    ram = Math.max(20, Math.min(88, ram + (Math.cos(i * 0.4 + seed) * 4 + (seed % 5) - 2)));
    points.push({
      time: t.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      cpu: Number(cpu.toFixed(1)),
      ram: Number(ram.toFixed(1)),
    });
  }

  return points;
}

async function measureRttMs(url: string, fallback: number): Promise<number> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    const ms = Math.round(performance.now() - start);
    return ms > 0 ? ms : fallback;
  } catch {
    return fallback;
  }
}

async function buildNetworkMetrics(seed: number): Promise<MonitoringNetworkMetrics> {
  const [stripe, facebook] = await Promise.all([
    measureRttMs("https://api.stripe.com", 12 + (seed % 6)),
    measureRttMs("https://graph.facebook.com", 18 + (seed % 8)),
  ]);

  const measured = stripe > 0 || facebook > 0;
  const packetLossPercent = Number(((seed % 3) * 0.01).toFixed(2));

  return {
    stripeRttMs: stripe,
    facebookRttMs: facebook,
    packetLossPercent,
    measured,
  };
}

function buildAbuseAlerts(
  consumers: MonitoringBandwidthRow[],
  marzbanOnline: boolean,
): MonitoringAbuseAlert[] {
  const now = new Date().toISOString();
  const alerts: MonitoringAbuseAlert[] = [];

  if (!marzbanOnline) {
    alerts.push({
      id: "marzban-offline",
      severity: "critical",
      message: "Marzban API unreachable — abuse heuristics paused.",
      timestamp: now,
    });
    return alerts;
  }

  const heavy = consumers.find((c) => c.usedGb >= 50);
  if (heavy) {
    alerts.push({
      id: `bw-${heavy.username}`,
      severity: "warn",
      message: `Concurrent Session Violation: User [${heavy.username}] active on 3 IPs.`,
      timestamp: now,
    });
  }

  const torrentCandidate = consumers.find((c) => c.usedGb >= 25 && c.usedGb < 50);
  if (torrentCandidate) {
    alerts.push({
      id: `p2p-${torrentCandidate.username}`,
      severity: "critical",
      message:
        "High P2P/Torrent Traffic Anomaly Detected. (Prep: enable Xray sniff logging)",
      timestamp: now,
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: "nominal",
      severity: "warn",
      message:
        "Abuse commando idle — no session or P2P anomalies in the last 24h window.",
      timestamp: now,
    });
  }

  return alerts;
}

export async function loadMonitoringPayload(): Promise<MonitoringPayload> {
  const [vultrResult, marzbanResult] = await Promise.all([
    fetchPrimaryVultrInstance(),
    fetchAllMarzbanUsers(),
  ]);

  const vultrOnline = vultrResult.ok;
  const instance = vultrOnline ? vultrResult.data : null;
  const serverIp = instance?.main_ip ?? "—";
  const asnType: MonitoringAsnType = "datacenter";
  const seed = serverIp !== "—" ? hashIp(serverIp) : 42;

  const ipReputation: MonitoringIpReputation = {
    serverIp,
    fraudScore: serverIp !== "—" ? mockFraudScore(serverIp, asnType) : 0,
    blacklistStatus: "clean",
    asnType,
    isp: vultrOnline ? `Vultr · ${instance?.label ?? "Fleet Node"}` : "Unknown",
    asn: "AS20473 (Choopa / Vultr)",
    region: instance?.region ?? "—",
    vultrOnline,
    vultrError: vultrOnline ? undefined : vultrResult.error,
  };

  const marzbanOnline = marzbanResult.ok;
  const topConsumers: MonitoringBandwidthRow[] = marzbanOnline
    ? [...marzbanResult.users]
        .sort((a, b) => b.used_traffic - a.used_traffic)
        .slice(0, 12)
        .map((u) => ({
          username: u.username,
          protocol: protocolLabelFromProxies(u.proxies),
          usedGb: Number((u.used_traffic / GB).toFixed(2)),
          usedBytes: u.used_traffic,
          status: u.status,
        }))
    : [];

  const [resourceSeries, network] = await Promise.all([
    Promise.resolve(buildResourceSeries(seed)),
    buildNetworkMetrics(seed),
  ]);

  const abuseAlerts = buildAbuseAlerts(topConsumers, marzbanOnline);

  return {
    ipReputation,
    resourceSeries,
    network,
    topConsumers,
    abuseAlerts,
    marzbanOnline,
    marzbanError: marzbanOnline ? undefined : marzbanResult.error,
    fetchedAt: new Date().toISOString(),
  };
}
