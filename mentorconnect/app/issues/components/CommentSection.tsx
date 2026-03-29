"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, User } from "lucide-react";

interface CommentAuthor {
  full_name: string;
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  is_internal_note: boolean;
  is_resolution_note: boolean;
  author_profile: CommentAuthor | null;
}

export function CommentSection({
  issueId,
  isLocked = false,
}: {
  issueId: string;
  isLocked?: boolean;
}) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  async function fetchComments() {
    const { data } = await supabase
      .from("issue_comments")
      .select(
        `
        id,
        body,
        created_at,
        author_id,
        is_internal_note,
        is_resolution_note
      `
      )
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      // Fetch author profiles separately
      const authorIds = [...new Set(data.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name")
        .in("user_id", authorIds);

      const profileMap: Record<string, string> = {};
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.user_id] = p.full_name;
        }
      }

      const mapped: Comment[] = data.map((c) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        author_id: c.author_id,
        is_internal_note: c.is_internal_note,
        is_resolution_note: c.is_resolution_note,
        author_profile: profileMap[c.author_id]
          ? { full_name: profileMap[c.author_id] }
          : null,
      }));
      setComments(mapped);
    } else {
      setComments([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || isLocked) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Ensure the auth user exists in the custom 'users' table (FK requirement)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      const email = user.email ?? "unknown@example.com";
      await supabase.from("users").insert({
        id: user.id,
        email,
        password_hash: "supabase_auth_managed",
        is_email_verified: true,
        status: "active",
        onboarding_status: "verified",
      });
      await supabase.from("user_profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || email.split("@")[0],
        college_email: email,
        department: "Not Specified",
        year_or_designation: "Not Specified",
        is_complete: false,
      });
    }

    const { error } = await supabase.from("issue_comments").insert({
      body: newComment,
      issue_id: issueId,
      author_id: user.id,
    });

    if (!error) {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  }

  function getCommentStyle(comment: Comment) {
    if (comment.is_resolution_note) {
      return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20";
    }
    if (comment.is_internal_note) {
      return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
    }
    return "bg-muted/50";
  }

  return (
    <div className="space-y-6 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg text-sm space-y-2 ${getCommentStyle(comment)}`}
              >
                {/* Note indicators */}
                {comment.is_resolution_note && (
                  <div className="flex items-center gap-1 text-green-700 dark:text-green-400 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolution Note
                  </div>
                )}
                {comment.is_internal_note && (
                  <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Internal Note
                  </div>
                )}

                <p className="whitespace-pre-wrap">{comment.body}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {comment.author_profile?.full_name ?? "Unknown"}
                  </span>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}

          {/* Comment form */}
          {isLocked ? (
            <p className="text-sm text-muted-foreground italic">
              This issue is locked. Comments are disabled.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newComment.trim()}>
                {loading ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
