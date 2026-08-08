import { AppShell } from "@/components/workspace/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AiAssistant } from "@/components/chat/AiAssistant";

const HIGHEST_ADMIN_ROLE_ID = 7;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: highestRole } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("role_id", HIGHEST_ADMIN_ROLE_ID)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <AppShell userEmail={user.email} showAdmin={Boolean(highestRole)}>
      {children}
      <AiAssistant />
    </AppShell>
  );
}

