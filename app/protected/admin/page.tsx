import { AdminAllocationPanel } from "@/components/admin-allocation-panel";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HIGHEST_ADMIN_ROLE_ID = 7;

type UserProfileRow = {
  user_id: string;
  full_name: string;
  college_email: string;
  department: string;
};

type UserRow = {
  id: string;
  email: string;
};

type MentorProfileRow = {
  user_id: string;
  max_mentees: number;
  current_mentees_count: number;
  is_accepting_mentees: boolean;
};

type ActiveMembershipRow = {
  mentee_id: string;
  group_id: string;
  joined_at: string;
};

type MentorGroupRow = {
  id: string;
  mentor_id: string;
};

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

export default async function AdminPanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Resolve the custom users table ID (may differ from auth.uid() for seeded data)
  const resolvedUserId = await resolveUserId(supabase, user);

  const { data: highestRole } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", resolvedUserId)
    .eq("role_id", HIGHEST_ADMIN_ROLE_ID)
    .eq("is_active", true)
    .maybeSingle();

  if (!highestRole) {
    redirect("/protected");
  }

  const [
    { data: allUsersData, error: allUsersError },
    { data: mentorProfilesData, error: mentorProfilesError },
    { data: menteeRoleRows, error: menteeRoleError },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("user_id, full_name, college_email, department")
      .order("full_name", { ascending: true }),
    supabase
      .from("mentor_ug_pg_profiles")
      .select("user_id, max_mentees, current_mentees_count, is_accepting_mentees"),
    supabase
      .from("user_roles")
      .select("user_id")
      .eq("role_id", 1)
      .eq("is_active", true),
  ]);

  console.log("Admin Panel Queries Errors:", {
    allUsersError,
    mentorProfilesError,
    menteeRoleError,
  });

  const allUsers = (allUsersData || []) as UserProfileRow[];
  const mentorProfiles = (mentorProfilesData || []) as MentorProfileRow[];
  
  // A mentee is any user who is not a mentor
  const mentorIdsSet = new Set(mentorProfiles.map((row) => row.user_id));
  const menteeIds = allUsers
    .map((user) => user.user_id)
    .filter((id) => !mentorIdsSet.has(id));
  const menteeIdSet = new Set(menteeIds);

  const { data: activeMembershipsData } = await supabase
    .from("mentor_group_members")
    .select("mentee_id, group_id, joined_at")
    .eq("status", "active");

  const activeMemberships = (activeMembershipsData || []) as ActiveMembershipRow[];
  const latestMembershipByMentee = new Map<string, ActiveMembershipRow>();

  for (const membership of activeMemberships) {
    const existing = latestMembershipByMentee.get(membership.mentee_id);
    if (!existing || new Date(membership.joined_at).getTime() > new Date(existing.joined_at).getTime()) {
      latestMembershipByMentee.set(membership.mentee_id, membership);
    }
  }

  const groupIds = Array.from(new Set(activeMemberships.map((membership) => membership.group_id)));
  const { data: groupsData } = groupIds.length
    ? await supabase.from("mentor_groups").select("id, mentor_id").in("id", groupIds)
    : { data: [] as MentorGroupRow[] };

  const groupsById = new Map<string, MentorGroupRow>(
    (((groupsData || []) as MentorGroupRow[]) || []).map((group) => [group.id, group]),
  );

  const mentorIdsFromGroups = Array.from(new Set((groupsData || []).map((group) => group.mentor_id as string)));
  const allMentorIds = Array.from(new Set([...mentorProfiles.map((mentor) => mentor.user_id), ...mentorIdsFromGroups]));

  const { data: mentorUserProfilesData } = allMentorIds.length
    ? await supabase
        .from("user_profiles")
        .select("user_id, full_name, college_email, department")
        .in("user_id", allMentorIds)
    : { data: [] as UserProfileRow[] };

  const mentorUserProfiles = (mentorUserProfilesData || []) as UserProfileRow[];
  const mentorUserById = new Map(mentorUserProfiles.map((profile) => [profile.user_id, profile]));
  const userProfileById = new Map(allUsers.map((profile) => [profile.user_id, profile]));

  const mentees = menteeIds.map((menteeId) => {
      const profile = userProfileById.get(menteeId);
      const membership = latestMembershipByMentee.get(menteeId);
      const mentorId = membership ? groupsById.get(membership.group_id)?.mentor_id ?? null : null;
      const mentor = mentorId ? mentorUserById.get(mentorId) : null;

      return {
        id: menteeId,
        name: profile?.full_name || "Profile incomplete",
        email: profile?.college_email || "Unknown email",
        department: profile?.department || "Not provided",
        currentMentorId: mentorId,
        currentMentorName: mentor?.full_name ?? null,
        currentMentorEmail: mentor?.college_email ?? null,
      };
    });

  const mentors = mentorProfiles.map((mentorProfile) => {
    const userProfile = mentorUserById.get(mentorProfile.user_id);

    return {
      id: mentorProfile.user_id,
      name: userProfile?.full_name || "Unknown mentor",
      email: userProfile?.college_email || null,
      department: userProfile?.department || null,
      currentMenteesCount: mentorProfile.current_mentees_count,
      maxMentees: mentorProfile.max_mentees,
      isAcceptingMentees: mentorProfile.is_accepting_mentees,
    };
  });

  const allUsersWithMentor = allUsers.map((profile) => {
    const membership = latestMembershipByMentee.get(profile.user_id);
    const mentorId = membership ? groupsById.get(membership.group_id)?.mentor_id ?? null : null;
    const mentor = mentorId ? mentorUserById.get(mentorId) : null;

    return {
      id: profile.user_id,
      name: profile.full_name || "Profile incomplete",
      email: profile.college_email || "Unknown email",
      department: profile.department || "Not provided",
      assignedMentorName: mentor?.full_name ?? null,
      assignedMentorEmail: mentor?.college_email ?? null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Highest-role authority controls for mentor assignment and manual allocation overrides.
        </p>
      </header>

      <AdminAllocationPanel mentees={mentees} mentors={mentors} allUsers={allUsersWithMentor} />
    </div>
  );
}
