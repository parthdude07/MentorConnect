import { createClient } from "@/lib/supabase/server";
import { IssueCard } from "./components/IssueCard";
import type { Issue } from "./components/IssueCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function IssuesPage() {
  const supabase = await createClient();

  // Fetch issues with category join
  const { data: rawIssues } = await supabase
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
      creator_id,
      category_id,
      issue_categories ( id, name )
    `
    )
    .order("created_at", { ascending: false });

  if (!rawIssues || rawIssues.length === 0) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <Link href="/issues/create">
            <Button>New Issue</Button>
          </Link>
        </div>
        <p className="text-muted-foreground">No issues found.</p>
      </div>
    );
  }

  // Fetch creator profiles separately
  const creatorIds = [...new Set(rawIssues.map((i) => i.creator_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, full_name, department")
    .in("user_id", creatorIds);

  const profileMap: Record<string, { full_name: string; department: string }> = {};
  if (profiles) {
    for (const p of profiles) {
      profileMap[p.user_id] = { full_name: p.full_name, department: p.department };
    }
  }

  // Fetch label mappings for all issues
  const issueIds = rawIssues.map((i) => i.id);
  const { data: tagMappings } = await supabase
    .from("issue_tag_map")
    .select("issue_id, issue_labels ( id, name, color )")
    .in("issue_id", issueIds);

  const issueLabelsMap: Record<string, { id: number; name: string; color: string }[]> = {};
  if (tagMappings) {
    for (const mapping of tagMappings) {
      const issueId = mapping.issue_id as string;
      if (!issueLabelsMap[issueId]) {
        issueLabelsMap[issueId] = [];
      }
      if (mapping.issue_labels) {
        const label = mapping.issue_labels as unknown as { id: number; name: string; color: string };
        issueLabelsMap[issueId].push(label);
      }
    }
  }

  // Combine into enriched Issue objects
  const issues: Issue[] = rawIssues.map((raw) => ({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    visibility: raw.visibility,
    is_anonymous: raw.is_anonymous,
    is_locked: raw.is_locked,
    view_count: raw.view_count,
    created_at: raw.created_at,
    issue_categories: raw.issue_categories as unknown as { id: number; name: string } | null,
    creator_profile: profileMap[raw.creator_id] ?? null,
    labels: issueLabelsMap[raw.id] ?? [],
  }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
        <Link href="/issues/create">
          <Button>New Issue</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
