/** Shared Marzban types — safe for Client Components (no server imports). */
export type MarzbanUserStats = {
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  status?: string;
};
