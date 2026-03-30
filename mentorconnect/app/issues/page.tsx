import { createClient } from "@/lib/supabase/server";
import { IssueCard } from "./components/IssueCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function IssuesPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("issues")
    .select("id, title, description, status, created_at, visibility, issue_categories(name)")
    .order("created_at", { ascending: false });

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

      <div className="grid gap-4 md:grid-cols-2">
        {issues?.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
