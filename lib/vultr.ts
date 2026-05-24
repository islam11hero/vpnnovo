import "server-only";

const VULTR_API = "https://api.vultr.com/v2";

export type VultrAccountInfo = {
  pending_charges: number;
  balance: number;
};

export type VultrInstance = {
  id: string;
  os: string;
  ram: number;
  main_ip: string;
  vcpu_count: number;
  region: string;
  label: string;
  status: string;
  allowed_bandwidth: number;
  power_status: string;
  server_status: string;
};

export type VultrResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function isVultrEnabled(): boolean {
  return Boolean(process.env.VULTR_API_KEY?.trim());
}

function getVultrApiKey(): string | null {
  const key = process.env.VULTR_API_KEY?.trim();
  return key || null;
}

async function vultrFetch<T>(path: string): Promise<VultrResult<T>> {
  const apiKey = getVultrApiKey();
  if (!apiKey) {
    return { ok: false, error: "VULTR_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${VULTR_API}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: text.slice(0, 200) || `Vultr HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vultr request failed";
    return { ok: false, error: message };
  }
}

export async function fetchVultrAccount(): Promise<
  VultrResult<VultrAccountInfo>
> {
  if (!isVultrEnabled()) {
    return { ok: false, error: "Vultr integration disabled" };
  }
  const result = await vultrFetch<{ account?: VultrAccountInfo }>("/account");
  if (!result.ok) return result;
  const account = result.data.account;
  if (!account) {
    return { ok: false, error: "Invalid Vultr account response" };
  }
  return {
    ok: true,
    data: {
      pending_charges: Number(account.pending_charges) || 0,
      balance: Number(account.balance) || 0,
    },
  };
}

export async function fetchVultrInstances(): Promise<
  VultrResult<VultrInstance[]>
> {
  if (!isVultrEnabled()) {
    return { ok: false, error: "Vultr integration disabled" };
  }
  const result = await vultrFetch<{ instances?: VultrInstance[] }>(
    "/instances",
  );
  if (!result.ok) return result;
  return { ok: true, data: result.data.instances ?? [] };
}

export async function fetchPrimaryVultrInstance(): Promise<
  VultrResult<VultrInstance | null>
> {
  const preferredId = process.env.VULTR_INSTANCE_ID?.trim();
  const list = await fetchVultrInstances();
  if (!list.ok) return list;

  if (preferredId) {
    const match = list.data.find((i) => i.id === preferredId);
    if (match) return { ok: true, data: match };
  }

  const active =
    list.data.find((i) => i.status === "active") ?? list.data[0] ?? null;
  return { ok: true, data: active };
}
