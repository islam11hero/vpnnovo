import { redirect } from "next/navigation";

import { ClientAuthForm } from "@/components/auth/ClientAuthForm";
import { linkPaidOrderToUser } from "@/lib/link-order";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/uuid";

type Props = {
  searchParams: { key?: string };
};

export default async function LoginPage({ searchParams }: Props) {
  const accessCode = searchParams.key?.trim() ?? "";
  const hasValidKey = accessCode.length > 0 && isValidUuid(accessCode);

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (hasValidKey) {
        await linkPaidOrderToUser(accessCode, user.id);
      }
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12 font-sans text-slate-100">
      <ClientAuthForm accessCode={hasValidKey ? accessCode : undefined} />
    </div>
  );
}
