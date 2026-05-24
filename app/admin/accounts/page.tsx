import {
  RegisteredUsersPanel,
  RegisteredUsersPanelHeader,
} from "@/components/admin/accounts/registered-users-panel";
import { loadRegisteredUsersForAdmin } from "@/lib/admin-registered-users";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const result = await loadRegisteredUsersForAdmin();

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <RegisteredUsersPanelHeader />
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-300">
            {result.error ??
              "Could not load registered users. Check SUPABASE_SERVICE_ROLE_KEY on the server."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <RegisteredUsersPanelHeader />
      <RegisteredUsersPanel users={result.users} total={result.total} />
    </div>
  );
}
