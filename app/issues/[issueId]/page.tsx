import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "../components/CommentSection";
import { ResolveIssueDialog } from "../components/ResolveIssueDialog";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, User, EyeOff } from "lucide-react";

// Role constants (must match DB)
const ROLE_PEER_MENTOR = 2;
const ROLE_PROFESSIONAL = 6;
const ROLE_ADMIN = 7;

/**
 * Resolve the custom `users.id` from the auth user.
 * Seeded users have hardcoded UUIDs that differ from auth.uid(),
 * so we look up by email as a fallback.
 */
async function resolveUserId(supabase: any, authUser: any): Promise<string> {
  // Try direct ID match first
  const { data: byId } = await supabase
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .maybeSingle();

  if (byId) return byId.id;

  // Fallback: match by email (for seeded users)
  if (authUser.email) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", authUser.email)
      .maybeSingle();

    if (byEmail) return byEmail.id;
  }

  // Last resort: use auth ID directly
  return authUser.id;
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: issue } = await supabase
    .from("issues")
    .select("*, issue_categories(name)")
    .eq("id", issueId)
    .single();

  if (!issue) {
    notFound();
  }

  // Check if current user is an admin or mentor
  let isAdmin = false;
  let isMentor = false;

  if (user) {
    // Resolve the custom users table ID (may differ from auth.uid() for seeded data)
    const resolvedUserId = await resolveUserId(supabase, user);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", resolvedUserId)
      .eq("is_active", true);

    if (roles && roles.length > 0) {
      const roleIds = roles.map((r: any) => Number(r.role_id));
      isAdmin = roleIds.includes(ROLE_ADMIN);
      isMentor = roleIds.some((id: number) => id >= ROLE_PEER_MENTOR && id <= ROLE_PROFESSIONAL);
    }
  }

  const isCreator = user?.id === issue.creator_id;
  // Admins, mentors, and the issue creator can resolve open issues
  const canResolve = (isAdmin || isMentor || isCreator) && issue.status !== "resolved" && issue.status !== "closed";

  // Fetch creator name for non-anonymous issues
  let creatorName: string | null = null;
  if (!issue.is_anonymous && issue.creator_id) {
    const { data: creatorProfile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", issue.creator_id)
      .maybeSingle();
    creatorName = creatorProfile?.full_name ?? null;
  }

  // Fetch resolution if resolved
  let resolution = null;
  if (issue.status === "resolved" || issue.status === "closed") {
    const { data: resData } = await supabase
      .from("issue_resolutions")
      .select("*, resolved_by_user:users!issue_resolutions_resolved_by_fkey(email)")
      .eq("issue_id", issueId)
      .single();
    resolution = resData;
  }

  const statusLabel = String(issue.status).replaceAll("_", " ");

  return (
    <div className="max-w-4xl space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{issue.title}</h1>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`border-transparent ${
                issue.status === "closed" || issue.status === "resolved" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-blue-100 text-black hover:bg-blue-100 dark:bg-blue-900/40 dark:text-white dark:hover:bg-blue-900/40"
              }`}
            >
              {statusLabel}
            </Badge>
            {canResolve && <ResolveIssueDialog issueId={issueId} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{issue.issue_categories?.name ?? "General"}</Badge>
          <Badge variant="outline" className="capitalize">
            {issue.visibility.replace("_", "-")}
          </Badge>
          {issue.is_anonymous ? (
            <span className="inline-flex items-center gap-1">
              <EyeOff className="h-3.5 w-3.5" />
              Anonymous
            </span>
          ) : creatorName ? (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {creatorName}
            </span>
          ) : null}
          <span>·</span>
          <span>Opened on {new Date(issue.created_at).toLocaleDateString()}</span>
        </div>

        <div className="mt-2 rounded-lg border bg-card p-6 text-card-foreground">
          <p className="whitespace-pre-wrap">{issue.description}</p>
        </div>

        {resolution && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Issue Resolved</h3>
            </div>
            <p className="whitespace-pre-wrap text-sm text-green-800 dark:text-green-300">
              {resolution.resolution_summary}
            </p>
            <div className="mt-4 pt-4 border-t border-green-200/50 dark:border-green-800/50 flex items-center justify-between text-xs text-green-600 dark:text-green-500">
              <span>Resolved on {new Date(resolution.closed_at).toLocaleDateString()}</span>
              {/* Could fetch contributing mentors names if needed */}
              <span>Mentors helped resolve this issue</span>
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-mono text-lg font-semibold mb-4">Discussion Thread</h2>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading comments...</p>}>
            <CommentSection issueId={issueId} isAdmin={isAdmin} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
