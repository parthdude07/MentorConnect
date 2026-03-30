import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelRow } from "@/components/workspace/insights-components";

const rooms = [
  {
    id: "cs-2027",
    mentor: "Ananya Singh",
    labels: ["CSE", "3rd Year", "Active"],
    openIssues: 4,
    members: 23,
  },
  {
    id: "ece-2026",
    mentor: "Vikram Patel",
    labels: ["ECE", "PG Mentor", "Active"],
    openIssues: 2,
    members: 17,
  },
  {
    id: "mech-2027",
    mentor: "Karan Mehta",
    labels: ["Mechanical", "Senior Mentor", "Active"],
    openIssues: 5,
    members: 20,
  },
];

export default function MentorRoomsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-2xl font-semibold">Mentor Rooms</h1>
        <p className="text-sm text-muted-foreground">Repository-style mentor spaces with discussions, issues, and tasks.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <Link key={room.id} href={`/protected/mentor-rooms/${room.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/40">
              <CardHeader>
                <CardTitle className="text-base">{room.mentor}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <LabelRow labels={room.labels} />
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{room.members} members</span>
                  <Badge variant="outline">{room.openIssues} open issues</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
