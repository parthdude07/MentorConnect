import { createClient } from "@/lib/supabase/server";
import { IssueCard } from "./components/IssueCard";
import { IssuesToolbar } from "./components/IssuesToolbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircleDot, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

export default async function IssuesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const state = searchParams.state === "closed" ? "closed" : "open";
  const search = typeof searchParams.search === "string" ? searchParams.search.trim() : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "score";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: openCount }, { count: closedCount }] = await Promise.all([
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_discussion", "needs_escalation"]),
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .in("status", ["resolved", "closed"])
  ]);

  let query = supabase
    .from("issues")
    .select("id, title, description, status, created_at, visibility, is_anonymous, creator_id, issue_categories(name), score, issue_comments(count)");

  // State filter (open/closed)
  if (state === "closed") {
    query = query.in("status", ["resolved", "closed"]);
  } else {
    query = query.in("status", ["open", "in_discussion", "needs_escalation"]);
  }

  // Search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Category filter
  if (category && category !== "all") {
    query = query.eq("issue_categories.name", category);
  }

  // Sort
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("score", { ascending: false });
  }

  const { data: issues } = await query;

  // Filter out issues where category didn't match (Supabase returns null for unmatched joins)
  const filteredIssues = category && category !== "all"
    ? (issues ?? []).filter(issue => issue.issue_categories !== null)
    : (issues ?? []);

  // Fetch creator names for non-anonymous issues
  const creatorIds = Array.from(
    new Set(
      filteredIssues
        .filter(i => !i.is_anonymous && i.creator_id)
        .map(i => i.creator_id)
    )
  );
  const creatorNameMap: Record<string, string> = {};
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, full_name")
      .in("user_id", creatorIds);
    if (profiles) {
      profiles.forEach((p: any) => {
        creatorNameMap[p.user_id] = p.full_name;
      });
    }
  }

  const userVotes: Record<string, 1 | -1> = {};
  if (user && filteredIssues.length > 0) {
    const issueIds = filteredIssues.map(i => i.id);
    const { data: votes } = await supabase
      .from("issue_votes")
      .select("issue_id, vote_type")
      .eq("user_id", user.id)
      .in("issue_id", issueIds);

    if (votes) {
      votes.forEach(v => {
        userVotes[v.issue_id] = v.vote_type as 1 | -1;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground">Track academic, personal, mental health, and career concerns.</p>
        </div>
        <Link href="/issues/create">
          <Button>New Issue</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Suspense fallback={null}>
        <IssuesToolbar />
      </Suspense>

      <div className="flex items-center gap-4 border-b pb-4">
        <Link
              
          href={`/issues?state=open${search ? `&search=${encodeURIComponent(search)}` : ""}${category && category !== "all" ? `&category=${encodeURIComponent(category)}` : ""}${sort !== "score" ? `&sort=${sort}` : ""}`}

          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            state === "open" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <CircleDot className="h-4 w-4" />
          {openCount || 0} Open
        </Link>
        
                  <Link
          href={`/issues?state=closed${search ? `&search=${encodeURIComponent(search)}` : ""}${category && category !== "all" ? `&category=${encodeURIComponent(category)}` : ""}${sort !== "score" ? `&sort=${sort}` : ""}`}

          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            state === "closed" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <CheckCircle className="h-4 w-4" />
          {closedCount || 0} Closed
        </Link>

        {/* Active filter indicators */}
        {(search || (category && category !== "all")) && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filtered</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                &quot;{search}&quot;
              </span>
            )}
            {category && category !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                {category}
              </span>
            )}
          </div>
        )}
      </div>

      {filteredIssues.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredIssues.map((issue) => {
            const cat = Array.isArray(issue.issue_categories) 
              ? issue.issue_categories[0] 
              : issue.issue_categories;
              
            return (
              <IssueCard 
                key={issue.id} 
                issue={{ 
                  ...issue, 
                  issue_categories: cat, 
                  userVote: userVotes[issue.id] || null,
                  is_anonymous: issue.is_anonymous ?? false,
                  creator_name: issue.is_anonymous
                    ? null
                    : creatorNameMap[issue.creator_id] ?? null,
                } as any} 
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            {state === "open" ? <CircleDot className="h-6 w-6 text-muted-foreground" /> : <CheckCircle className="h-6 w-6 text-muted-foreground" />}
          </div>
          <h3 className="text-lg font-semibold">No issues found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {search || (category && category !== "all")
              ? "No issues match your current filters. Try adjusting your search or category."
              : `There are no ${state} issues at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
