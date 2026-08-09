import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Building2,
  GraduationCap,
  Shield,
  Calendar,
  Sparkles,
} from "lucide-react";
import { InlineBioEditor } from "@/components/profile/inline-bio-editor";
import { MentorProfileSection } from "@/components/profile/mentor-profile-section";
import { MenteeProfileSection } from "@/components/profile/mentee-profile-section";

// Role ID constants (must match your DB)
const ROLE_MENTEE = 1;
const ROLE_PEER_MENTOR = 2;
const ROLE_SENIOR_MENTOR = 3;
const ROLE_PROFESSIONAL = 6;
const ROLE_ADMIN = 7;

const MENTOR_ROLES = new Set([ROLE_PEER_MENTOR, ROLE_SENIOR_MENTOR, ROLE_PROFESSIONAL]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns the user's avatar initials (2 chars) */
function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  pending_verification: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  deactivated: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const roleGradients: Record<string, string> = {
  mentor: "from-blue-600 via-blue-500 to-sky-400",
  professional: "from-blue-700 via-blue-600 to-indigo-500",
  mentee: "from-sky-500 via-blue-500 to-indigo-500",
  admin: "from-slate-600 via-slate-500 to-slate-400",
  default: "from-blue-600 to-sky-500",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const authUserId = user.id;

  // ── Fetch custom user row ────────────────────────────────────────────────
  let { data: dbUser } = await supabase
    .from("users")
    .select("id, email, status, onboarding_status, created_at, last_login_at")
    .eq("id", authUserId)
    .maybeSingle();

  if (!dbUser && user.email) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id, email, status, onboarding_status, created_at, last_login_at")
      .eq("email", user.email)
      .maybeSingle();
    dbUser = byEmail;
  }

  const resolvedUserId = dbUser?.id ?? authUserId;

  // ── Fetch user profile ───────────────────────────────────────────────────
  let { data: profileData } = await supabase
    .from("user_profiles")
    .select("full_name, college_email, department, year_or_designation, short_bio, is_complete")
    .eq("user_id", resolvedUserId)
    .maybeSingle();

  if (!profileData && user.email) {
    const { data: byEmail } = await supabase
      .from("user_profiles")
      .select("full_name, college_email, department, year_or_designation, short_bio, is_complete")
      .eq("college_email", user.email)
      .maybeSingle();
    profileData = byEmail;
  }

  if (!profileData) {
    const fallbackName =
      user.user_metadata?.full_name ??
      user.email?.split("@")[0]?.replace(/[._-]+/g, " ") ??
      "New User";

    await supabase.from("user_profiles").upsert(
      {
        user_id: authUserId,
        full_name: fallbackName,
        college_email: user.email ?? `${user.id}@CounselConnect.local`,
        department: "Not Specified",
        year_or_designation: "Not Specified",
        short_bio: null,
        is_complete: false,
      },
      { onConflict: "user_id" },
    );

    const { data: bootstrapped } = await supabase
      .from("user_profiles")
      .select("full_name, college_email, department, year_or_designation, short_bio, is_complete")
      .eq("user_id", authUserId)
      .maybeSingle();

    profileData = bootstrapped;
  }

  // fallback: try admin client
  if (!profileData && user.email) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data: adminProfile } = await adminClient
        .from("user_profiles")
        .select("full_name, college_email, department, year_or_designation, short_bio, is_complete")
        .eq("college_email", user.email)
        .maybeSingle();
      profileData = adminProfile;
    }
  }

  // ── Fetch roles ──────────────────────────────────────────────────────────
  const { data: userRolesData } = await supabase
    .from("user_roles")
    .select("role_id, is_active, roles ( display_title )")
    .eq("user_id", resolvedUserId);

  const roles = (userRolesData ?? []).map((r) => ({
    title: (r.roles as unknown as { display_title: string })?.display_title ?? "Unknown",
    is_active: r.is_active,
    role_id: r.role_id as number,
  }));

  // Determine the user's primary role category
  const activeRoleIds = roles.filter((r) => r.is_active).map((r) => r.role_id);
  const highestActiveRoleId = Math.max(0, ...activeRoleIds);

  const isAdmin = activeRoleIds.includes(ROLE_ADMIN);
  const isMentor = !isAdmin && activeRoleIds.some((id) => MENTOR_ROLES.has(id));
  const isMentee = !isAdmin && !isMentor && activeRoleIds.includes(ROLE_MENTEE);
  const isProfessional = activeRoleIds.includes(ROLE_PROFESSIONAL);

  let avatarGradient = roleGradients.default;
  let profileTypeLabel = "Member";
  if (isAdmin) { avatarGradient = roleGradients.admin; profileTypeLabel = "System Admin"; }
  else if (isProfessional) { avatarGradient = roleGradients.professional; profileTypeLabel = "Professional Counsellor"; }
  else if (isMentor) { avatarGradient = roleGradients.mentor; profileTypeLabel = "Mentor"; }
  else if (isMentee) { avatarGradient = roleGradients.mentee; profileTypeLabel = "Mentee"; }

  // ── Fetch interests ──────────────────────────────────────────────────────
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest_tags ( name, category )")
    .eq("user_id", resolvedUserId);

  const interests = (userInterests ?? [])
    .map((i) => (i.interest_tags as unknown as { name: string; category: string }))
    .filter(Boolean);

  // ── Fetch assigned mentor (for mentees) ──────────────────────────────────
  let assignedMentor: {
    mentorId: string;
    name: string;
    email: string | null;
    department: string | null;
    groupId: string;
    joinedAt: string | null;
  } | null = null;

  if (isMentee || !isAdmin) {
    const { data: activeMembership } = await supabase
      .from("mentor_group_members")
      .select("group_id, joined_at")
      .eq("mentee_id", authUserId)
      .eq("status", "active")
      .order("joined_at", { ascending: false })
      .maybeSingle();

    if (activeMembership?.group_id) {
      const { data: mentorGroup } = await supabase
        .from("mentor_groups")
        .select("mentor_id")
        .eq("id", activeMembership.group_id)
        .maybeSingle();

      if (mentorGroup?.mentor_id) {
        const { data: mentorProfile } = await supabase
          .from("user_profiles")
          .select("full_name, college_email, department")
          .eq("user_id", mentorGroup.mentor_id)
          .maybeSingle();

        assignedMentor = {
          mentorId: mentorGroup.mentor_id,
          name: mentorProfile?.full_name || "Unknown mentor",
          email: mentorProfile?.college_email || null,
          department: mentorProfile?.department || null,
          groupId: activeMembership.group_id,
          joinedAt: activeMembership.joined_at || null,
        };
      }
    }
  }

  // ── Fetch mentor-specific data ───────────────────────────────────────────
  let mentorProfile: {
    mentoring_domains: string[] | null;
    past_experience_desc: string | null;
    max_mentees: number | null;
    current_mentees_count: number | null;
    is_accepting_mentees: boolean | null;
  } | null = null;

  let professionalProfile: {
    qualification: string | null;
    years_of_experience: number | null;
    specialization_areas: string[] | null;
    is_emergency_available: boolean | null;
  } | null = null;

  if (isMentor) {
    if (isProfessional) {
      const { data: profData } = await supabase
        .from("professional_profiles")
        .select("qualification, years_of_experience, specialization_areas, is_emergency_available")
        .eq("user_id", resolvedUserId)
        .maybeSingle();
      professionalProfile = profData;
    } else {
      const { data: ugpgData } = await supabase
        .from("mentor_ug_pg_profiles")
        .select("mentoring_domains, past_experience_desc, max_mentees, current_mentees_count, is_accepting_mentees")
        .eq("user_id", resolvedUserId)
        .maybeSingle();
      mentorProfile = ugpgData;
    }
  }

  // ── Fetch mentee-specific data ───────────────────────────────────────────
  let menteeData: {
    current_challenges: string[] | null;
    preferred_mentor_background: string | null;
    communication_preference: "chat" | "call" | "both" | null;
  } | null = null;

  if (isMentee) {
    const { data: mData } = await supabase
      .from("mentee_profiles")
      .select("current_challenges, preferred_mentor_background, communication_preference")
      .eq("user_id", resolvedUserId)
      .maybeSingle();
    menteeData = mData as typeof menteeData;
  }

  const profile = profileData;
  const initials = getInitials(profile?.full_name ?? null, user.email ?? "?");

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Profile incomplete banner */}
      {profile && !profile.is_complete && (
        <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 flex items-center gap-2">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          Your profile is incomplete — fill in all details for better mentor matching.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">
          {/* Hero Card */}
          <Card className="overflow-hidden">
            {/* Gradient banner — name + role label live INSIDE the strip */}
            <div className={`relative h-28 bg-gradient-to-r ${avatarGradient}`}>
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 bg-black/10" />
              {/* Name + label pinned to the bottom-left of the banner */}
              <div className="absolute bottom-3 left-5 right-5 flex items-end gap-3">
                <div
                  className={`h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ring-white/30 flex-shrink-0`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-white truncate leading-tight drop-shadow-sm">
                    {profile?.full_name ?? user.email?.split("@")[0] ?? "New User"}
                  </h1>
                  <p className="text-xs text-white/80 font-medium tracking-wide">
                    {profileTypeLabel}
                  </p>
                </div>
                {dbUser && (
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 border-white/30 bg-white/20 text-white backdrop-blur-sm`}
                  >
                    {dbUser.status?.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="pt-4 px-6 pb-6">
              {/* Contact + department row */}
              <div className="grid gap-2 sm:grid-cols-2 text-sm mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile?.college_email ?? user.email}</span>
                </div>
                {profile?.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile?.year_or_designation && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.year_or_designation}</span>
                  </div>
                )}
              </div>

              {/* Inline Bio Editor */}
              {profile && (
                <InlineBioEditor initialBio={profile.short_bio ?? null} />
              )}
            </CardContent>
          </Card>

          {/* Roles Card */}
          {roles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role, idx) => (
                    <Badge
                      key={idx}
                      variant={role.is_active ? "default" : "secondary"}
                      className="text-xs rounded-full px-3 py-1"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Interests & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs rounded-full px-3 py-1 bg-primary/5 border-primary/20"
                    >
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {new Date(dbUser.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {dbUser.last_login_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last login</span>
                    <span>{new Date(dbUser.last_login_at).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Onboarding</span>
                  <Badge variant="outline" className="text-xs">
                    {dbUser.onboarding_status?.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT COLUMN — strictly role-gated by highest active role ── */}
        <div className="space-y-5">
          {/* MENTOR view: highest role is 2, 3, or 6 */}
          {isMentor && (
            <MentorProfileSection
              mentorProfile={mentorProfile}
              professionalProfile={professionalProfile}
              menteeCount={mentorProfile?.current_mentees_count ?? 0}
              isMentorType={isProfessional ? "professional" : "ug_pg"}
            />
          )}
          {/* MENTEE view: only when highest role is exactly 1 (mentee) */}
          {isMentee && (
            <MenteeProfileSection
              assignedMentor={assignedMentor}
              menteeData={menteeData}
              userId={resolvedUserId}
            />
          )}
          {/* ADMIN view */}
          {isAdmin && (
            <Card className="border-slate-500/20 bg-slate-500/5">
              <CardContent className="py-6 text-center">
                <Shield className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">System Administrator</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the{" "}
                  <a href="/protected/admin" className="text-primary underline underline-offset-2">
                    Admin Panel
                  </a>{" "}
                  to run matching and manage allocations.
                </p>
              </CardContent>
            </Card>
          )}
          {/* No-role fallback */}
          {!isAdmin && !isMentor && !isMentee && (
            <Card className="border-dashed border-muted-foreground/30">
              <CardContent className="py-6 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Role not assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete onboarding to get a role assigned.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
