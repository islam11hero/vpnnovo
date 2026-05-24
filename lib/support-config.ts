/** Public support channels — configure in Vercel env. */
export type SupportConfig = {
  email: string;
  mailto: string;
  telegramUrl: string | null;
  telegramLabel: string | null;
  siteUrl: string;
};

export function getSupportConfig(): SupportConfig {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.nordvp.online";

  const email =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@nordvp.online";

  const telegramRaw = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM?.trim() ?? "";
  let telegramUrl: string | null = null;
  let telegramLabel: string | null = null;

  if (telegramRaw) {
    if (telegramRaw.startsWith("http")) {
      telegramUrl = telegramRaw;
    } else if (telegramRaw.startsWith("@")) {
      telegramUrl = `https://t.me/${telegramRaw.slice(1)}`;
      telegramLabel = telegramRaw;
    } else {
      telegramUrl = `https://t.me/${telegramRaw}`;
      telegramLabel = `@${telegramRaw}`;
    }
    telegramLabel ??= telegramRaw.startsWith("@")
      ? telegramRaw
      : `@${telegramRaw}`;
  }

  return {
    email,
    mailto: `mailto:${email}?subject=${encodeURIComponent("NovaVPN Support")}`,
    telegramUrl,
    telegramLabel,
    siteUrl,
  };
}

export function portalOrderUrl(orderId: string): string {
  const { siteUrl } = getSupportConfig();
  return `${siteUrl}/portal/${orderId}`;
}
