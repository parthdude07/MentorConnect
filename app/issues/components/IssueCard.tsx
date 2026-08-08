import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { IssueVoteControls } from "./IssueVoteControls";

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  visibility?: string;
  issue_categories?: { name: string } | null;
  score: number;
  userVote: 1 | -1 | null;
  issue_comments?: { count: number }[] | { count: number };
}

export function IssueCard({ issue }: { issue: Issue }) {
  const statusLabel = issue.status.replaceAll("_", " ");

  return (
    <Card className="hover:bg-accent/40 transition-colors relative">
      <Link href={`/issues/${issue.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View Issue</span>
      </Link>
      <CardHeader className="relative z-10 pointer-events-none">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg pointer-events-auto">
            <Link href={`/issues/${issue.id}`} className="hover:underline">
              {issue.title}
            </Link>
          </CardTitle>
          <Badge variant={issue.status === "closed" || issue.status === "resolved" ? "secondary" : "default"} className="pointer-events-auto">
            {statusLabel}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {issue.description}
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 text-xs mt-2 pointer-events-auto">
          <Badge variant="outline">{issue.issue_categories?.name ?? "General"}</Badge>
          <Badge variant="outline" className="capitalize">
            {issue.visibility ?? "public"}
          </Badge>
          <div className="ml-auto flex items-center gap-4">
            <IssueVoteControls 
              issueId={issue.id} 
              initialScore={issue.score ?? 0} 
              initialUserVote={issue.userVote} 
            />
            <span className="text-muted-foreground flex items-center gap-1">
              💬 {Array.isArray(issue.issue_comments) ? issue.issue_comments[0]?.count || 0 : (issue.issue_comments as any)?.count || 0}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Created on {new Date(issue.created_at).toLocaleDateString()}
        </div>
      </CardHeader>
    </Card>
  );
}
