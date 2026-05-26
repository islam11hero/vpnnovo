/** Machine-readable routing flags stored in Marzban user `note`. */

export const ROUTING_TAG_TORRENT = "block_torrent";
export const ROUTING_TAG_ADS = "block_ads";

const LEGACY_TORRENT = ["no_p2p", "no-torrent", "block p2p"];
const LEGACY_ADS = ["no_ads", "no-ads", "block ads"];

export type RoutingNoteFlags = {
  blockTorrent: boolean;
  blockAds: boolean;
};

export function routingFlagsFromNote(note: string | null | undefined): RoutingNoteFlags {
  const n = (note ?? "").toLowerCase();
  return {
    blockTorrent:
      n.includes(ROUTING_TAG_TORRENT) ||
      LEGACY_TORRENT.some((tag) => n.includes(tag)),
    blockAds:
      n.includes(ROUTING_TAG_ADS) || LEGACY_ADS.some((tag) => n.includes(tag)),
  };
}

/** Strip routing tags; keep human admin notes (e.g. throttle messages). */
function stripRoutingTags(note: string): string {
  const tokens = note
    .split(/[·|,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const kept = tokens.filter((token) => {
    const lower = token.toLowerCase();
    if (lower === ROUTING_TAG_TORRENT || lower === ROUTING_TAG_ADS) return false;
    if (LEGACY_TORRENT.some((t) => lower.includes(t))) return false;
    if (LEGACY_ADS.some((t) => lower.includes(t))) return false;
    return true;
  });

  return kept.join(" · ").trim();
}

export function buildRoutingNote(
  existingNote: string | null | undefined,
  flags: RoutingNoteFlags,
): string {
  const base = stripRoutingTags(existingNote ?? "");
  const tags: string[] = [];
  if (flags.blockTorrent) tags.push(ROUTING_TAG_TORRENT);
  if (flags.blockAds) tags.push(ROUTING_TAG_ADS);

  if (!base && !tags.length) return "";
  if (!base) return tags.join(" · ");
  if (!tags.length) return base;
  return `${base} · ${tags.join(" · ")}`;
}

export function toggleRoutingFlag(
  existingNote: string | null | undefined,
  flag: "torrent" | "ads",
): { flags: RoutingNoteFlags; note: string } {
  const current = routingFlagsFromNote(existingNote);
  const next: RoutingNoteFlags = {
    blockTorrent:
      flag === "torrent" ? !current.blockTorrent : current.blockTorrent,
    blockAds: flag === "ads" ? !current.blockAds : current.blockAds,
  };
  return {
    flags: next,
    note: buildRoutingNote(existingNote, next),
  };
}
