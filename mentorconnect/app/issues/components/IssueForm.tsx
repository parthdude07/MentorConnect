"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Category {
  id: number;
  name: string;
}

interface IssueLabel {
  id: number;
  name: string;
  color: string;
}

export function IssueForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<IssueLabel[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

  // Controlled form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    async function fetchOptions() {
      const [catRes, labelRes] = await Promise.all([
        supabase
          .from("issue_categories")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
        supabase.from("issue_labels").select("id, name, color").order("name"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (labelRes.data) setLabels(labelRes.data);
    }
    fetchOptions();
  }, []);

  function toggleLabel(id: number) {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

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

    // Ensure the auth user exists in the custom 'users' table (FK requirement)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      const email = user.email ?? "unknown@example.com";
      const { error: userInsertError } = await supabase.from("users").insert({
        id: user.id,
        email,
        password_hash: "supabase_auth_managed",
        is_email_verified: true,
        status: "active",
        onboarding_status: "verified",
      });

      if (userInsertError) {
        setError("Failed to register user profile: " + userInsertError.message);
        setLoading(false);
        return;
      }

      // Also create a basic user_profiles entry
      await supabase.from("user_profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || email.split("@")[0],
        college_email: email,
        department: "Not Specified",
        year_or_designation: "Not Specified",
        is_complete: false,
      });
    }

    const { data: newIssue, error: insertError } = await supabase
      .from("issues")
      .insert({
        title,
        description,
        creator_id: user.id,
        category_id: categoryId ? parseInt(categoryId) : null,
        visibility: visibility || "public",
        is_anonymous: isAnonymous,
        status: "open",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Insert label mappings
    if (newIssue && selectedLabels.length > 0) {
      const labelMappings = selectedLabels.map((label_id) => ({
        issue_id: newIssue.id,
        label_id,
      }));
      await supabase.from("issue_tag_map").insert(labelMappings);
    }

    router.push("/issues");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
        <CardDescription>
          Describe the issue you&apos;re facing. Choose a category and
          visibility level.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief summary of the issue"
              required
              disabled={loading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide details about the issue..."
              required
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              name="category_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              name="visibility"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="ultra_private">Ultra Private</option>
            </select>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              className="h-4 w-4 rounded border-input"
              disabled={loading}
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <Label htmlFor="is_anonymous" className="font-normal">
              Post anonymously
            </Label>
          </div>

          {/* Labels multi-select */}
          {labels.length > 0 && (
            <div className="space-y-2">
              <Label>Labels</Label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      disabled={loading}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                        isSelected
                          ? "text-white border-transparent"
                          : "bg-background text-foreground border-input hover:bg-accent"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: label.color, borderColor: label.color }
                          : undefined
                      }
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
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
