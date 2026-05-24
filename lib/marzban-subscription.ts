/**
 * Normalize Marzban user payloads (Axios `.data`, nested `data`, POST/GET shapes).
 */
export function unwrapMarzbanPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const top = raw as Record<string, unknown>;

  if (
    top.data &&
    typeof top.data === "object" &&
    !Array.isArray(top.data)
  ) {
    return top.data as Record<string, unknown>;
  }

  return top;
}

function normalizeLinks(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && "url" in entry) {
        return String((entry as { url: unknown }).url);
      }
      return "";
    })
    .filter(Boolean);
}

/**
 * Extract subscription URL/path from a Marzban user object.
 */
export function extractMarzbanSubscriptionFromPayload(
  apiUrl: string,
  raw: unknown,
): string {
  const payload = unwrapMarzbanPayload(raw);
  const base = apiUrl.replace(/\/$/, "");

  const direct =
    (typeof payload.subscription_url === "string" && payload.subscription_url) ||
    (typeof payload.subscriptionUrl === "string" && payload.subscriptionUrl) ||
    "";

  if (direct.trim()) {
    const trimmed = direct.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  const links = normalizeLinks(payload.links);
  if (links.length > 0) {
    return links[0];
  }

  return "";
}
