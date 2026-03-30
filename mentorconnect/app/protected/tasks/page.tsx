import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRow } from "@/components/workspace/insights-components";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Task Tracking</h1>
        <p className="text-sm text-muted-foreground">Authority-assigned goals with progress and reminder signals.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-sm">Weekly Mentor Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          <div className="rounded-md border p-3">
            <p className="font-medium">Conduct 3 discussions this week</p>
            <p className="mt-1 text-xs text-muted-foreground">Assigned to CSE mentor cluster · due Friday</p>
            <div className="mt-3">
              <ProgressRow label="Completion" value={66} />
            </div>
          </div>
          <ProgressRow label="Escalation response SLA" value={82} />
          <ProgressRow label="Mentee follow-up completion" value={58} />
        </CardContent>
      </Card>
    </div>
  );
}
