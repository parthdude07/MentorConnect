import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiscussionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Discussions</h1>
        <p className="text-sm text-muted-foreground">Thread feeds, mentions, and role-aware responses.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-sm">Active Threads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Mentor</Badge>
              <Badge variant="outline">Academic</Badge>
            </div>
            <p className="mt-2 font-medium">Exam Stress Management Plan</p>
            <p className="mt-1 text-muted-foreground">@student build a revision matrix and share blockers by EOD.</p>
          </div>
          <div className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Mentee</Badge>
              <Badge variant="outline">Career</Badge>
            </div>
            <p className="mt-2 font-medium">Resume Feedback Round 2</p>
            <p className="mt-1 text-muted-foreground">5 comments · 9 reactions · last update 18 minutes ago</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
