export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

export const ADMIN_ROUTES = {
  overview: "/admin",
  clients: "/admin/clients",
  finances: "/admin/finances",
  settings: "/admin/settings",
  login: ADMIN_LOGIN_PATH,
} as const;

/** Paths that exist under /app/admin (excludes login). */
const ADMIN_ALLOWED_PATHS = new Set<string>([
  ADMIN_HOME_PATH,
  ADMIN_ROUTES.clients,
  ADMIN_ROUTES.finances,
  ADMIN_ROUTES.settings,
]);

/**
 * Normalize post-login / middleware redirects — rejects typos like /admin/l.
 */
export function resolveAdminRedirectPath(
  path: string | null | undefined,
): string {
  const raw = (path ?? "").trim() || ADMIN_HOME_PATH;
  const pathOnly = raw.split("?")[0].split("#")[0].replace(/\/$/, "") || ADMIN_HOME_PATH;

  if (!pathOnly.startsWith("/admin")) {
    return ADMIN_HOME_PATH;
  }

  if (
    pathOnly === ADMIN_LOGIN_PATH ||
    pathOnly.startsWith(`${ADMIN_LOGIN_PATH}/`)
  ) {
    return ADMIN_HOME_PATH;
  }

  if (ADMIN_ALLOWED_PATHS.has(pathOnly)) {
    return pathOnly;
  }

  return ADMIN_HOME_PATH;
}
