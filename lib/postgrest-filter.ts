/** Escape a value for PostgREST `.eq."value"` filters (commas, dots, quotes). */
export function postgrestFilterValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '""')}"`;
}

/** `marzban_username.eq."x",vpn_username.eq."x"` */
export function orderUsernameOrFilter(username: string): string {
  const trimmed = username.trim();
  const encoded = postgrestFilterValue(trimmed);
  return `marzban_username.eq.${encoded},vpn_username.eq.${encoded}`;
}
