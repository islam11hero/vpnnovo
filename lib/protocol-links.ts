export type ProtocolFocus = "vision" | "xhttp";

export function appendQueryParam(
  baseUrl: string,
  key: string,
  value: string,
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

/** Mobile / general web — VLESS Vision (TCP). */
export function buildVisionSubscriptionUrl(baseUrl: string): string {
  return appendQueryParam(baseUrl, "core", "vision");
}

/** Desktop automation — XHTTP split-tunnel profile. */
export function buildXhttpSubscriptionUrl(baseUrl: string): string {
  return appendQueryParam(baseUrl, "core", "xhttp");
}

export function buildSingboxProfileUrl(baseUrl: string): string {
  return appendQueryParam(buildXhttpSubscriptionUrl(baseUrl), "fps", "sing-box");
}

export function buildClashMetaProfileUrl(baseUrl: string): string {
  return appendQueryParam(buildXhttpSubscriptionUrl(baseUrl), "fps", "clash");
}

export function buildV2boxDeepLink(subUrl: string): string {
  return `v2box://install-sub?url=${encodeURIComponent(subUrl)}&name=IPNOVA`;
}

export function buildV2rayNgDeepLink(subUrl: string): string {
  return `v2rayng://install-sub?url=${encodeURIComponent(subUrl)}&name=IPNOVA`;
}
