import { OpsecVault, type OpsecVaultProps } from "@/components/dashboard/OpsecVault";

/** Portal entry — always renders the real OPSEC vault (no Stripe cloak). */
export function ClientDashboard(props: OpsecVaultProps) {
  return <OpsecVault {...props} />;
}
