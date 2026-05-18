/** Compare egress IPs from independent probes to infer DNS/route consistency. */
export async function probeDnsLeakStatus(): Promise<{
  status: "loading" | "masked" | "leak" | "blocked";
  egressIp: string | null;
  resolverIp: string | null;
}> {
  let egressIp: string | null = null;
  let resolverIp: string | null = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const [geoRes, traceRes] = await Promise.all([
      fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        cache: "no-store",
      }),
      fetch("https://1.1.1.1/cdn-cgi/trace", {
        signal: controller.signal,
        cache: "no-store",
      }),
    ]);

    clearTimeout(timer);

    if (!geoRes.ok) {
      return { status: "blocked", egressIp: null, resolverIp: null };
    }

    const geo = (await geoRes.json()) as { ip?: string };
    egressIp = geo.ip?.trim() ?? null;

    if (traceRes.ok) {
      const text = await traceRes.text();
      const ipLine = text
        .split("\n")
        .find((line) => line.startsWith("ip="));
      resolverIp = ipLine?.replace("ip=", "").trim() ?? null;
    }

    if (!egressIp) {
      return { status: "blocked", egressIp: null, resolverIp: null };
    }

    if (resolverIp && resolverIp !== egressIp) {
      return { status: "leak", egressIp, resolverIp };
    }

    return { status: "masked", egressIp, resolverIp: resolverIp ?? egressIp };
  } catch {
    return { status: "blocked", egressIp: null, resolverIp: null };
  }
}
