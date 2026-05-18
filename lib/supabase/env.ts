/** Normalize Supabase env vars (trim, strip quotes, trailing slashes on URL). */

function clean(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServiceEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

function getSupabaseAnonKey(): string {
  return (
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/$/, "");
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseServiceEnv(): SupabaseServiceEnv | null {
  const pub = getSupabasePublicEnv();
  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!pub || !serviceRoleKey) return null;
  return { ...pub, serviceRoleKey };
}

export function listMissingSupabaseServiceKeys(): string[] {
  const missing: string[] = [];
  if (!clean(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!getSupabaseAnonKey()) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)");
  }
  if (!clean(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  return missing;
}
