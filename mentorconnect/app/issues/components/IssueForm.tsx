"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function IssueForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create an issue.");
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const issueType = formData.get("issueType") as string;
    const visibility = formData.get("visibility") as string;

    let categoryId: number | null = null;

    const { data: category } = await supabase
      .from("issue_categories")
      .select("id")
      .eq("name", issueType)
      .maybeSingle();

    if (category?.id) {
      categoryId = category.id;
    }

    const { error } = await supabase.from("issues").insert({
      title,
      description,
      creator_id: user.id,
      status: "open",
      visibility,
      category_id: categoryId,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/issues");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
        <CardDescription>
          Describe your concern, set issue type, and choose visibility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Issue title"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the issue..."
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueType">Type</Label>
              <select id="issueType" name="issueType" disabled={loading} defaultValue="Academic">
                <option>Academic</option>
                <option>Personal</option>
                <option>Mental Health</option>
                <option>Career</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <select id="visibility" name="visibility" disabled={loading} defaultValue="public">
                <option value="public">Public</option>
                <option value="private">Private (only mentor)</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
