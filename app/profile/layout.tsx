import { AppShell } from "@/components/workspace/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HIGHEST_ADMIN_ROLE_ID = 7;

export default async function ProfileLayout({
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

  // Fetch active user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const isMentee = userRole?.role_id === 1;
  const showAdmin = userRole?.role_id === 7;

  return (
    <AppShell userEmail={user.email} showAdmin={showAdmin} isMentee={isMentee}>
      {children}
    </AppShell>
  );
}
