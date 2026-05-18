import {
  buildClashMetaProfileUrl,
  buildSingboxProfileUrl,
  buildXhttpSubscriptionUrl,
} from "@/lib/protocol-links";

export function extractHostFromSubLink(subLink: string): string | null {
  try {
    const url = new URL(subLink);
    return url.hostname || null;
  } catch {
    return null;
  }
}

/** AdsPower / Dolphin `IP:Port:User:Pass` line for SOCKS5 import. */
export function buildAdsPowerProxyLine(
  subLink: string,
  vpnUsername: string,
): string {
  const host = extractHostFromSubLink(subLink) ?? "proxy.ipnova.network";
  const user = vpnUsername.trim() || "ipnova_client";
  return `${host}:443:${user}:${user}`;
}

export function buildClashYamlSnippet(subLink: string): string {
  const profileUrl = buildClashMetaProfileUrl(subLink);
  return `# IPNOVA · Clash Meta / Mihomo (2026)
proxy-providers:
  ipnova-stealth:
    type: http
    url: "${profileUrl}"
    interval: 3600
    path: ./ipnova-proxies.yaml
    health-check:
      enable: true
      interval: 300
      url: http://www.gstatic.com/generate_204

proxy-groups:
  - name: IPNOVA-SELECT
    type: select
    use:
      - ipnova-stealth`;
}

export function buildSingboxYamlSnippet(subLink: string): string {
  const profileUrl = buildSingboxProfileUrl(subLink);
  return `# IPNOVA · Sing-box (2026)
{
  "outbounds": [
    {
      "type": "subscription",
      "tag": "ipnova",
      "url": "${profileUrl}",
      "update_interval": "1h"
    }
  ]
}`;
}

/** Raw import URI — XHTTP automation profile for desktop stacks. */
export function buildRawVlessImportUri(subLink: string): string {
  return buildXhttpSubscriptionUrl(subLink);
}
