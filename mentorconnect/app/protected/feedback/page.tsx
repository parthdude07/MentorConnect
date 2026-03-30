"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackPage() {
  const [anonymous, setAnonymous] = useState(true);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Feedback System</h1>
        <p className="text-sm text-muted-foreground">Anonymous-first feedback intake with AI summary and sentiment indicators.</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous((value) => !value)}
                aria-label="Submit anonymously"
                className="h-4 w-4"
              />
              <span>Submit as anonymous</span>
            </label>
            <textarea
              className="min-h-[140px] rounded-md border bg-card px-3 py-2"
              placeholder="Share your experience or concern..."
            />
            <div className="text-xs text-muted-foreground">
              Mode: {anonymous ? "Anonymous" : "Visible to assigned mentor"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">AI Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="rounded-md border p-3 text-muted-foreground">
              Students request quicker response times during pre-exam weeks and prefer evening mentorship slots.
            </p>
            <Badge variant="outline">Sentiment: Mixed Positive</Badge>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-sm">Feedback History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="rounded-md border p-3">Week 12 · Anonymous · &quot;Need more mental health check-ins&quot;</div>
          <div className="rounded-md border p-3">Week 11 · Visible · &quot;Mentor sessions are practical and actionable&quot;</div>
        </CardContent>
      </Card>
    </div>
  );
}
