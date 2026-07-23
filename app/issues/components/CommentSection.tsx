"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsUp, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { validateContent } from "@/lib/content-filter";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  is_internal_note: boolean;
}

export function CommentSection({ issueId, isAdmin = false }: { issueId: string, isAdmin?: boolean }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    
    setError(null);
    const commentValidation = validateContent(newComment);
    if (!commentValidation.isValid) {
      setError("Your comment contains restricted words. Please revise.");
      return;
    }

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
      is_internal_note: isInternalNote,
    });

    if (!error) {
      setNewComment("");
      setIsInternalNote(false);
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
                className={`space-y-2 rounded-lg border p-4 text-sm ${comment.is_internal_note ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {comment.author_id.slice(0, 1) < "8" ? "Mentor" : "Mentee"}
                  </Badge>
                  {comment.is_internal_note && (
                    <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800">
                      <Lock className="h-3 w-3 mr-1" /> Internal Note
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{comment.body}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => bumpReaction(comment.id, "like")}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" /> {reactionCounts[comment.id]?.like ?? 0}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => bumpReaction(comment.id, "support")}
                  >
                    <Heart className="h-3 w-3 mr-1" /> {reactionCounts[comment.id]?.support ?? 0}
                  </Button>
                </div>
              </div>
            ))
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6 pt-4 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="internal-note" 
                  checked={isInternalNote} 
                  onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="internal-note"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Lock className="h-3 w-3 mr-1" /> Mark as internal mentor note (hidden from mentee)
                </label>
              </div>
            )}
            
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
