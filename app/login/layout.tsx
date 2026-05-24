import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | IPNOVA Client Vault",
  description: "Authenticate to access your OPSEC vault, crypto wallet, and node controls.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
