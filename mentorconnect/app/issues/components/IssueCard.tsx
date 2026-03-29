import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Eye, EyeOff, Lock, MessageSquare, User } from "lucide-react";

interface IssueLabel {
  id: number;
  name: string;
  color: string;
}

interface IssueCategory {
  id: number;
  name: string;
}

interface CreatorProfile {
  full_name: string;
  department: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_discussion" | "needs_escalation" | "resolved" | "closed";
  visibility: "public" | "private" | "ultra_private";
  is_anonymous: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  issue_categories: IssueCategory | null;
  creator_profile: CreatorProfile | null;
  labels: IssueLabel[];
}

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

const visibilityIcon: Record<string, React.ReactNode> = {
  public: <Eye className="h-3 w-3" />,
  private: <EyeOff className="h-3 w-3" />,
  ultra_private: <Lock className="h-3 w-3" />,
};

export function IssueCard({ issue }: { issue: Issue }) {
  const creatorName = issue.is_anonymous
    ? "Anonymous"
    : issue.creator_profile?.full_name ?? "Unknown";

  return (
    <Link href={`/issues/${issue.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <CardHeader className="space-y-3">
          {/* Status + Visibility row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant={statusVariantMap[issue.status] ?? "default"}>
                {statusLabelMap[issue.status] ?? issue.status}
              </Badge>
              {issue.issue_categories && (
                <Badge variant="outline" className="text-xs">
                  {issue.issue_categories.name}
                </Badge>
              )}
            </div>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              {visibilityIcon[issue.visibility]}
              {issue.visibility === "ultra_private" ? "Ultra Private" : issue.visibility}
            </span>
          </div>

          {/* Title */}
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {issue.title}
          </CardTitle>

          {/* Description */}
          <CardDescription className="line-clamp-2">
            {issue.description}
          </CardDescription>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer: creator, views, date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {creatorName}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {issue.view_count}
              </span>
              <span>
                {new Date(issue.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
