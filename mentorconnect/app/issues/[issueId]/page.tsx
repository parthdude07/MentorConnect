import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "../components/CommentSection";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("issues")
    .select("*, issue_categories(name)")
    .eq("id", issueId)
    .single();

  if (!issue) {
    notFound();
  }

  const statusLabel = String(issue.status).replaceAll("_", " ");

  return (
    <div className="max-w-4xl space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{issue.title}</h1>
          <Badge variant={issue.status === "closed" || issue.status === "resolved" ? "secondary" : "default"}>
            {statusLabel}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{issue.issue_categories?.name ?? "General"}</Badge>
          <Badge variant="outline" className="capitalize">
            {issue.visibility}
          </Badge>
          <Badge variant="outline">Assigned: Mentor Team A</Badge>
          <span>Opened on {new Date(issue.created_at).toLocaleDateString()}</span>
        </div>

        <div className="mt-2 rounded-lg border bg-card p-6 text-card-foreground">
          <p className="whitespace-pre-wrap">{issue.description}</p>
        </div>

        <div className="mt-10">
          <h2 className="font-mono text-lg font-semibold mb-4">Discussion Thread</h2>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading comments...</p>}>
            <CommentSection issueId={issueId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
