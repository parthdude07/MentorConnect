"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsUp } from "lucide-react";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
}

export function CommentSection({ issueId }: { issueId: string }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<string, { like: number; support: number }>>({});

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("issue_comments")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (data) {
      setComments(data);
      const initialReactions: Record<string, { like: number; support: number }> = {};
      data.forEach((comment) => {
        initialReactions[comment.id] = { like: 0, support: 0 };
      });
      setReactionCounts(initialReactions);
    }
  }, [issueId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function bumpReaction(commentId: string, key: "like" | "support") {
    setReactionCounts((current) => ({
      ...current,
      [commentId]: {
        like: current[commentId]?.like ?? 0,
        support: current[commentId]?.support ?? 0,
        [key]: (current[commentId]?.[key] ?? 0) + 1,
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
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
                className="space-y-2 rounded-lg border p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {comment.author_id.slice(0, 1) < "8" ? "Mentor" : "Mentee"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{comment.body}</p>
                <p className="text-xs text-muted-foreground">
                  Use @student mentions for targeted responses.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bumpReaction(comment.id, "like")}
                  >
                    <ThumbsUp className="h-3 w-3" /> {reactionCounts[comment.id]?.like ?? 0}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bumpReaction(comment.id, "support")}
                  >
                    <Heart className="h-3 w-3" /> {reactionCounts[comment.id]?.support ?? 0}
                  </Button>
                </div>
              </div>
            ))
          )}

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
        </CardContent>
      </Card>
    </div>
  );
}
