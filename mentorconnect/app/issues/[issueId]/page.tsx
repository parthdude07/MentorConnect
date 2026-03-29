import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "../components/CommentSection";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  in_discussion: "outline",
  needs_escalation: "destructive",
  resolved: "secondary",
  closed: "secondary",
};

const statusLabelMap: Record<string, string> = {
  open: "Open",
  in_discussion: "In Discussion",
  needs_escalation: "Needs Escalation",
  resolved: "Resolved",
  closed: "Closed",
};

export default async function IssuePage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const supabase = await createClient();

  // Fetch the issue with category and creator profile
  const { data: issue } = await supabase
    .from("issues")
    .select(
      `
      id,
      title,
      description,
      status,
      visibility,
      is_anonymous,
      is_locked,
      view_count,
      created_at,
      updated_at,
      closed_at,
      creator_id,
      category_id,
      issue_categories ( id, name )
    `
    )
    .eq("id", issueId)
    .single();

  if (!issue) {
    notFound();
  }

  // Fetch creator profile separately
  const { data: creatorProfileData } = await supabase
    .from("user_profiles")
    .select("full_name, department")
    .eq("user_id", issue.creator_id)
    .single();

  // Fetch labels for this issue
  const { data: tagMappings } = await supabase
    .from("issue_tag_map")
    .select("issue_labels ( id, name, color )")
    .eq("issue_id", issueId);

  const labels = (tagMappings ?? [])
    .map((m) => m.issue_labels as unknown as { id: number; name: string; color: string })
    .filter(Boolean);

  const category = issue.issue_categories as unknown as { id: number; name: string } | null;
  const creator = creatorProfileData as { full_name: string; department: string } | null;
  const creatorName = issue.is_anonymous ? "Anonymous" : creator?.full_name ?? "Unknown";
  const creatorDept = issue.is_anonymous ? null : creator?.department;

  const visibilityIcons: Record<string, React.ReactNode> = {
    public: <Eye className="h-4 w-4" />,
    private: <EyeOff className="h-4 w-4" />,
    ultra_private: <Lock className="h-4 w-4" />,
  };

  const visibilityLabels: Record<string, string> = {
    public: "Public",
    private: "Private",
    ultra_private: "Ultra Private",
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
          <Badge variant={statusVariantMap[issue.status] ?? "default"} className="shrink-0">
            {statusLabelMap[issue.status] ?? issue.status}
          </Badge>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Category */}
          {category && (
            <Badge variant="outline">{category.name}</Badge>
          )}

          {/* Visibility */}
          <span className="flex items-center gap-1">
            {visibilityIcons[issue.visibility]}
            {visibilityLabels[issue.visibility] ?? issue.visibility}
          </span>

          {/* Creator */}
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {creatorName}
            {creatorDept && <span className="text-xs">({creatorDept})</span>}
          </span>

          {/* Views */}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {issue.view_count} views
          </span>

          {/* Date */}
          <span>
            Opened on {new Date(issue.created_at).toLocaleDateString()}
          </span>

          {issue.closed_at && (
            <span>
              Closed on {new Date(issue.closed_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Locked banner */}
        {issue.is_locked && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400">
            <Lock className="h-4 w-4" />
            This issue is locked. No new comments can be added.
          </div>
        )}

        {/* Description */}
        <div className="prose dark:prose-invert max-w-none p-6 border rounded-lg bg-card text-card-foreground">
          <p className="whitespace-pre-wrap">{issue.description}</p>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Comments</h2>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">
                Loading comments...
              </p>
            }
          >
            <CommentSection issueId={issueId} isLocked={issue.is_locked} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
