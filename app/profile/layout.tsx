import { AppShell } from "@/components/workspace/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HIGHEST_ADMIN_ROLE_ID = 7;

/**
 * Resolve the custom `users.id` from the auth user.
 * Seeded users have hardcoded UUIDs that differ from auth.uid(),
 * so we look up by email as a fallback.
 */
async function resolveUserId(supabase: any, authUser: any): Promise<string> {
  const { data: byId } = await supabase
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .maybeSingle();

  if (byId) return byId.id;

  if (authUser.email) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", authUser.email)
      .maybeSingle();

    if (byEmail) return byEmail.id;
  }

  return authUser.id;
}

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

  // Resolve the custom users table ID (may differ from auth.uid() for seeded data)
  const resolvedUserId = await resolveUserId(supabase, user);

  // Only show the Admin Panel sidebar link if the user actually has admin role
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", resolvedUserId)
    .eq("role_id", HIGHEST_ADMIN_ROLE_ID)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <AppShell userEmail={user.email} showAdmin={Boolean(adminRole)}>
      {children}
    </AppShell>
  );
}
