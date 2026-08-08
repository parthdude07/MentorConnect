import { ActivityTimeline, InsightsMetricCard, ProgressRow } from "@/components/workspace/insights-components";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userRoleData } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const roleId = userRoleData?.role_id ?? 1;
  const isMentee = roleId === 1;

  let openIssueCount = 0;
  let discussionCount = 0;
  let recentIssues: any[] = [];
  let timelineItems: any[] = [];
  let notifications: any[] = [];
  let weeklyStats = { label1: "", val1: 0, label2: "", val2: 0, label3: "", val3: 0 };

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString();

  if (isMentee) {
    const { count: openCount } = await supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id)
      .neq("status", "resolved")
      .neq("status", "closed");
    openIssueCount = openCount ?? 0;

    const { data: recent } = await supabase
      .from("issues")
      .select("id, title, status, created_at")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);
    recentIssues = recent ?? [];

    const { count: issuesThisWeek } = await supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id)
      .gte("created_at", oneWeekAgoStr);

    const { count: commentsThisWeek } = await supabase
      .from("issue_comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", oneWeekAgoStr);

    weeklyStats = {
      label1: "Issues created (7d)",
      val1: issuesThisWeek ?? 0,
      label2: "Comments made (7d)",
      val2: commentsThisWeek ?? 0,
      label3: "Active issues",
      val3: openCount ?? 0,
    };

    const { data: recentHistory } = await supabase
      .from("issue_status_history")
      .select("id, new_status, changed_at, issues!inner(title)")
      .eq("issues.creator_id", user.id)
      .order("changed_at", { ascending: false })
      .limit(3);

    timelineItems = (recentHistory ?? []).map((h: any) => ({
      id: h.id,
      title: `Issue "${h.issues.title}" status changed to ${String(h.new_status).replaceAll("_", " ")}`,
      meta: new Date(h.changed_at).toLocaleString(),
      type: h.new_status === "resolved" ? "success" : "info",
    }));
  } else {
    // Mentor / Admin
    const { data: myAssignments } = await supabase
      .from("issue_assignments")
      .select("issue_id")
      .eq("mentor_id", user.id);
    const assignedIssueIds = (myAssignments ?? []).map((a) => a.issue_id);

    if (assignedIssueIds.length > 0) {
      const { data: issuesData } = await supabase
        .from("issues")
        .select("id, title, status, created_at")
        .in("id", assignedIssueIds)
        .neq("status", "resolved")
        .neq("status", "closed");
      openIssueCount = issuesData?.length ?? 0;

      const { data: recent } = await supabase
        .from("issues")
        .select("id, title, status, created_at")
        .in("id", assignedIssueIds)
        .order("created_at", { ascending: false })
        .limit(4);
      recentIssues = recent ?? [];

      const { data: recentHistory } = await supabase
        .from("issue_status_history")
        .select("id, new_status, changed_at, issues(title)")
        .in("issue_id", assignedIssueIds)
        .order("changed_at", { ascending: false })
        .limit(3);

      timelineItems = (recentHistory ?? []).map((h: any) => ({
        id: h.id,
        title: `Issue "${h.issues?.title}" status changed to ${String(h.new_status).replaceAll("_", " ")}`,
        meta: new Date(h.changed_at).toLocaleString(),
        type: h.new_status === "resolved" ? "success" : "info",
      }));
    }

    const { count: resolvedThisWeek } = await supabase
      .from("issue_resolutions")
      .select("*", { count: "exact", head: true })
      .contains("contributing_mentors", [user.id])
      .gte("closed_at", oneWeekAgoStr);

    const { count: commentsThisWeek } = await supabase
      .from("issue_comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", oneWeekAgoStr);

    const { count: activeMentees } = await supabase
      .from("mentor_group_members")
      .select("id, mentor_groups!inner(mentor_id)", { count: "exact", head: true })
      .eq("mentor_groups.mentor_id", user.id)
      .eq("status", "active");

    weeklyStats = {
      label1: "Issues resolved (7d)",
      val1: resolvedThisWeek ?? 0,
      label2: "Comments made (7d)",
      val2: commentsThisWeek ?? 0,
      label3: "Active mentees",
      val3: activeMentees ?? 0,
    };
  }

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);
  notifications = notifs ?? [];

  const { count: totalComments } = await supabase
    .from("issue_comments")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);
  discussionCount = totalComments ?? 0;

  if (timelineItems.length === 0) {
    timelineItems = [
      {
        id: "empty",
        title: "No recent activity",
        meta: "Get started by exploring issues or updating your profile",
        type: "info",
      }
    ];
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Activity overview for {user?.email}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightsMetricCard 
          title={isMentee ? "My Activity Summary" : "Mentor Activity Summary"} 
          value={isMentee ? (weeklyStats.val1 + weeklyStats.val2).toString() : (weeklyStats.val1 * 5 + weeklyStats.val2).toString()} 
          delta="Total activity score" 
        />
        <InsightsMetricCard 
          title={isMentee ? "Engagement Level" : "Mentee Engagement"} 
          value={`${weeklyStats.val2} interactions`} 
          delta="Comments in last 7 days" 
        />
        <InsightsMetricCard 
          title="Weekly Statistics" 
          value={isMentee ? `${weeklyStats.val1} issues` : `${weeklyStats.val1} resolved`} 
          delta="In the last 7 days" 
        />
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
            <CardTitle className="font-mono text-sm">Weekly Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressRow label={weeklyStats.label1} value={weeklyStats.val1 > 100 ? 100 : weeklyStats.val1 * 10} />
            <ProgressRow label={weeklyStats.label2} value={weeklyStats.val2 > 100 ? 100 : weeklyStats.val2 * 5} />
            <ProgressRow label={weeklyStats.label3} value={weeklyStats.val3 > 100 ? 100 : weeklyStats.val3 * 20} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActivityTimeline items={timelineItems} />

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {notifications.length ? (
              notifications.map((n) => (
                <div key={n.id} className="rounded-md border p-3">
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-muted-foreground mt-1">{n.body}</p>}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground p-3 border rounded-md">No new notifications.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

