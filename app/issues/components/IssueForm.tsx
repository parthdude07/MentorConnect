"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateContent } from "@/lib/content-filter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IssueForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [issueType, setIssueType] = useState("Academic");
  const [visibility, setVisibility] = useState("public");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const titleValidation = validateContent(title);
    if (!titleValidation.isValid) {
      setError("Your title contains restricted words. Please revise.");
      setLoading(false);
      return;
    }

    const descValidation = validateContent(description);
    if (!descValidation.isValid) {
      setError("Your description contains restricted words. Please revise.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create an issue.");
      setLoading(false);
      return;
    }

    let categoryId: number | null = null;

    const { data: category } = await supabase
      .from("issue_categories")
      .select("id")
      .eq("name", issueType)
      .maybeSingle();

    if (category?.id) {
      categoryId = category.id;
    }

    const { error: insertError } = await supabase.from("issues").insert({
      title,
      description,
      creator_id: user.id,
      status: "open",
      visibility,
      category_id: categoryId,
    });

    if (insertError) {
      setError(insertError.message);
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
            <Textarea
              id="description"
              name="description"
              className="min-h-[120px]"
              placeholder="Describe the issue..."
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueType">Type</Label>
              <Select disabled={loading} value={issueType} onValueChange={setIssueType}>
                <SelectTrigger id="issueType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select disabled={loading} value={visibility} onValueChange={setVisibility}>
                <SelectTrigger id="visibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private (Mentors Only)</SelectItem>
                  <SelectItem value="ultra_private">Ultra-Private (Counsellor Only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                {visibility === 'public' && "Visible to all students and mentors."}
                {visibility === 'private' && "Only you and assigned mentors can see this."}
                {visibility === 'ultra_private' && "Only the Counselling Head can see this. Highest privacy."}
              </p>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
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
