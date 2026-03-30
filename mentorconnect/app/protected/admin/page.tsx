import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPanelPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Authority controls for escalations, performance, and emergency actions.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Mentor Performance Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">Ananya Singh · 4.8/5 · 23 mentees supported</div>
            <div className="rounded-md border p-3">Rahul Sharma · 4.6/5 · 17 mentees supported</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Escalation System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <Badge variant="secondary">Open Escalation</Badge>
              <p className="mt-2">Mental-health issue flagged for immediate review.</p>
            </div>
            <div className="rounded-md border p-3">SLA: response under 30 minutes for critical tags.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Emergency Identity Reveal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">Available only for approved emergency workflows.</div>
            <button type="button" className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
              Request reveal audit action
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Engagement Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">Campus-wide mentor engagement: 79%</div>
            <div className="rounded-md border p-3">Student follow-up completion: 68%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
