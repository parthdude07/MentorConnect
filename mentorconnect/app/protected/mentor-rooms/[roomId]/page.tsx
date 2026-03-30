import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelRow } from "@/components/workspace/insights-components";
import { MessageSquare, ThumbsUp } from "lucide-react";

const tabNames = ["Discussions", "Issues", "Tasks", "Members", "Activity"];

export default async function MentorRoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <div className="space-y-6">
      <header className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-mono text-2xl font-semibold">Mentor Room · {roomId.toUpperCase()}</h1>
          <Badge variant="secondary">Active</Badge>
        </div>
        <LabelRow labels={["Department: CSE", "Year: 2027", "Mentor: Ananya Singh"]} />
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Mentor room tabs">
        {tabNames.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`rounded-md border px-3 py-1.5 text-sm ${
              index === 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Threaded Discussions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <article className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">How to balance academics with placement prep?</p>
                <Badge variant="outline">Academic</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">
                @student we can split your week into DSA + one project sprint. I&apos;ll share a template.
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> 7 replies
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> 14 reactions
                </span>
              </div>
            </article>

            <article className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Mentor</Badge>
                <Badge variant="outline">Career</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">
                Mock interview room open Friday 6 PM. Mention @student_name to reserve a slot.
              </p>
            </article>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Room Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <Badge variant="secondary">Authority</Badge>
              <p className="mt-2">Escalation policy acknowledged for mental health thread.</p>
            </div>
            <div className="rounded-md border p-3">
              <Badge variant="outline">Mentee</Badge>
              <p className="mt-2">New member joined from CSE section A.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
