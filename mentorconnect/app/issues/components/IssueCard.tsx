import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  visibility?: string;
  issue_categories?: { name: string } | null;
}

export function IssueCard({ issue }: { issue: Issue }) {
  const statusLabel = issue.status.replaceAll("_", " ");

  return (
    <Link href={`/issues/${issue.id}`}>
      <Card className="cursor-pointer hover:bg-accent/40 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{issue.title}</CardTitle>
            <Badge variant={issue.status === "closed" || issue.status === "resolved" ? "secondary" : "default"}>
              {statusLabel}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {issue.description}
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{issue.issue_categories?.name ?? "General"}</Badge>
            <Badge variant="outline" className="capitalize">
              {issue.visibility ?? "public"}
            </Badge>
            <span className="text-muted-foreground ml-auto">👍 8 · 💬 3</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Created on {new Date(issue.created_at).toLocaleDateString()}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
