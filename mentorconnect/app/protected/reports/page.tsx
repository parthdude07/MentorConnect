import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ChartBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights-style dashboard for mentor activity and resolution outcomes.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Mentor Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartBar label="Session Completion" value={87} />
            <ChartBar label="Thread Participation" value={74} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Student Participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartBar label="Weekly Active Mentees" value={69} />
            <ChartBar label="Feedback Submission Rate" value={54} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Issue Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">18.4h</p>
            <p className="text-xs text-muted-foreground">Average time from open to resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Feedback Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartBar label="Positive" value={62} />
            <ChartBar label="Neutral" value={24} />
            <ChartBar label="Negative" value={14} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
