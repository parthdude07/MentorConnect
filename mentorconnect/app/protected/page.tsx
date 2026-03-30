import { ActivityTimeline, InsightsMetricCard, ProgressRow } from "@/components/workspace/insights-components";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: openIssueCount } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .neq("status", "resolved")
    .neq("status", "closed");

  const { count: discussionCount } = await supabase
    .from("issue_comments")
    .select("*", { count: "exact", head: true });

  const { data: recentIssues } = await supabase
    .from("issues")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Activity overview for {user?.email}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightsMetricCard title="Mentor Activity Summary" value="84%" delta="+6% vs last week" />
        <InsightsMetricCard title="Mentee Engagement Stats" value="71%" delta="+12 new interactions" />
        <InsightsMetricCard title="Weekly Discussion Goals" value="18 / 24" delta="6 discussions remaining" />
        <InsightsMetricCard
          title="Open Issues"
          value={`${openIssueCount ?? 0}`}
          delta={`${discussionCount ?? 0} total comments tracked`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Recent Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIssues?.length ? (
              recentIssues.map((issue) => (
                <div key={issue.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <Badge variant="outline" className="capitalize">
                      {String(issue.status).replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No issue activity yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Weekly Discussion Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressRow label="Mentor-led sessions" value={72} />
            <ProgressRow label="Peer follow-up threads" value={61} />
            <ProgressRow label="Escalation closure" value={89} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActivityTimeline
          items={[
            {
              id: "1",
              title: "Career issue moved to in discussion",
              meta: "Mentor Rahul · 12 minutes ago",
              type: "info",
            },
            {
              id: "2",
              title: "Mental health case escalated to authority",
              meta: "Emergency protocol triggered · 1 hour ago",
              type: "warning",
            },
            {
              id: "3",
              title: "Weekly goal marked complete",
              meta: "3 discussions conducted by Team B · Today",
              type: "success",
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">2 new mentee requests awaiting assignment.</div>
            <div className="rounded-md border p-3">1 anonymous feedback requires review.</div>
            <div className="rounded-md border p-3">Mentor room CS-2027 exceeded weekly engagement target.</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

