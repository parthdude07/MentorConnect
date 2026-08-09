import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchAllMentors } from "@/app/actions/mentors";
import { MentorCard } from "./MentorCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Star, TrendingUp } from "lucide-react";

export default async function MentorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const mentors = await fetchAllMentors();

  // Compute aggregate stats
  const totalMentors = mentors.length;
  const availableMentors = mentors.filter((m) => m.isAcceptingMentees).length;
  const totalIssuesSolved = mentors.reduce((sum, m) => sum + m.issuesResolved, 0);
  const avgRatingAll =
    mentors.filter((m) => m.avgRating !== null).length > 0
      ? (
          mentors
            .filter((m) => m.avgRating !== null)
            .reduce((sum, m) => sum + (m.avgRating ?? 0), 0) /
          mentors.filter((m) => m.avgRating !== null).length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            Mentors
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse all available mentors. Click <strong>Message</strong> to start a
          1-on-1 conversation with any mentor.
        </p>
      </header>

      {/* Overview Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalMentors}</p>
              <p className="text-xs text-muted-foreground">Total Mentors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{availableMentors}</p>
              <p className="text-xs text-muted-foreground">Available Now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/10 bg-gradient-to-br from-sky-500/5 to-blue-500/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalIssuesSolved}</p>
              <p className="text-xs text-muted-foreground">Issues Solved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-blue-500/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRatingAll}</p>
              <p className="text-xs text-muted-foreground">Avg. Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Grid */}
      {mentors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mentors.map((mentor, index) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              currentUserId={user.id}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No mentors found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            There are no mentors registered in the system yet.
          </p>
        </div>
      )}
    </div>
  );
}
