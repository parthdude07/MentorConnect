import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "../components/CommentSection";
import { ResolveIssueDialog } from "../components/ResolveIssueDialog";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

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

  // Check if current user is an admin (role_id = 7)
  let isAdmin = false;
  if (user) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .eq("is_active", true);
    
    if (roles && roles.some(r => r.role_id === 7)) {
      isAdmin = true;
    }
  }

  const isCreator = user?.id === issue.creator_id;
  const canResolve = isAdmin && issue.status !== "resolved" && issue.status !== "closed";

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
