/** Canonical public app URL for NOWPayments callbacks and redirects. */
export function getAppUrl(): string {
  const app =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return app || "http://localhost:3000";
}
