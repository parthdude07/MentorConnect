import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, GraduationCap, Shield, Calendar } from "lucide-react";
import { TriggerMatchingButton } from "@/components/trigger-matching-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch user record from custom users table
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, email, status, onboarding_status, created_at, last_login_at")
    .eq("id", user.id)
    .single();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, college_email, department, year_or_designation, short_bio, is_complete")
    .eq("user_id", user.id)
    .single();

  // Fetch user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id, is_active, roles ( display_title )")
    .eq("user_id", user.id);

  // Fetch user interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest_tags ( name, category )")
    .eq("user_id", user.id);

  const roles = (userRoles ?? []).map((r) => ({
    title: (r.roles as unknown as { display_title: string })?.display_title ?? "Unknown",
    is_active: r.is_active,
  }));

  const interests = (userInterests ?? []).map(
    (i) => (i.interest_tags as unknown as { name: string; category: string })
  ).filter(Boolean);

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    pending_verification: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
    deactivated: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <TriggerMatchingButton userId={user.id} />

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              {(profile?.full_name ?? user.email ?? "?")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {profile?.full_name ?? "Profile Not Set Up"}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {profile?.college_email ?? user.email}
              </CardDescription>
            </div>
            {dbUser && (
              <Badge
                variant="outline"
                className={statusColors[dbUser.status] ?? ""}
              >
                {dbUser.status?.replace("_", " ")}
              </Badge>
            )}
          </div>
        </CardHeader>

        {profile && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{profile.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Year:</span>
                <span className="font-medium">{profile.year_or_designation}</span>
              </div>
            </div>

            {profile.short_bio && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                <p className="text-sm whitespace-pre-wrap">{profile.short_bio}</p>
              </div>
            )}

            {!profile.is_complete && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400">
                Your profile is incomplete. Fill in all details for a better experience.
              </div>
            )}
          </CardContent>
        )}

        {!profile && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No profile found. Your basic account information is shown above.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Roles Card */}
      {roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, idx) => (
                <Badge
                  key={idx}
                  variant={role.is_active ? "default" : "secondary"}
                  className="text-sm"
                >
                  {role.title}
                  {!role.is_active && " (inactive)"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests Card */}
      {interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {interest?.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info Card */}
      {dbUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span>{new Date(dbUser.created_at).toLocaleDateString()}</span>
            </div>
            {dbUser.last_login_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last login</span>
                <span>{new Date(dbUser.last_login_at).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Onboarding</span>
              <Badge variant="outline" className="text-xs">
                {dbUser.onboarding_status?.replace("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
