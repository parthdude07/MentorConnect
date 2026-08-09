"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Search,
  Target,
  Phone,
  MessageCircle,
  Layers,
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  updateCommunicationPreference,
  updateMentorBackgroundPreference,
} from "@/app/actions/profile";

interface AssignedMentor {
  mentorId: string;
  name: string;
  email: string | null;
  department: string | null;
  groupId: string;
  joinedAt: string | null;
}

interface MenteeData {
  current_challenges: string[] | null;
  preferred_mentor_background: string | null;
  communication_preference: "chat" | "call" | "both" | null;
}

interface MenteeProfileSectionProps {
  assignedMentor: AssignedMentor | null;
  menteeData: MenteeData | null;
  userId: string;
}

const commPrefConfig = {
  chat: { icon: MessageCircle, label: "Chat", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  call: { icon: Phone, label: "Call", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  both: { icon: Layers, label: "Chat & Call", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
};

function CommPrefSelector({ initialPref }: { initialPref: "chat" | "call" | "both" }) {
  const [pref, setPref] = useState(initialPref);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleChange = (next: "chat" | "call" | "both") => {
    if (next === pref) return;
    startTransition(async () => {
      const res = await updateCommunicationPreference(next);
      if (res.success) {
        setPref(next);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Preference</p>
        {saved && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs text-emerald-500"
          >
            <Check className="h-3 w-3" /> Saved
          </motion.span>
        )}
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["chat", "call", "both"] as const).map((option) => {
          const cfg = commPrefConfig[option];
          const Icon = cfg.icon;
          const active = pref === option;
          return (
            <button
              key={option}
              onClick={() => handleChange(option)}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? `${cfg.bg} ${cfg.color} border-current`
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MentorBackgroundEditor({ initialValue }: { initialValue: string | null }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleBlur = () => {
    if (value.trim() === (initialValue ?? "").trim()) return;
    startTransition(async () => {
      const res = await updateMentorBackgroundPreference(value);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Mentor Background Preference
        </label>
        {saved && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs text-emerald-500"
          >
            <Check className="h-3 w-3" /> Saved
          </motion.span>
        )}
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="e.g., Frontend Developer, Research background…"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

export function MenteeProfileSection({
  assignedMentor,
  menteeData,
  userId,
}: MenteeProfileSectionProps) {
  const challenges = menteeData?.current_challenges ?? [];
  const commPref = menteeData?.communication_preference ?? "both";

  return (
    <div className="space-y-4">
      {/* Assigned Mentor Card */}
      {assignedMentor ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Users className="h-4 w-4" />
              Your Assigned Mentor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {assignedMentor.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{assignedMentor.name}</p>
                {assignedMentor.email && (
                  <p className="text-xs text-muted-foreground truncate">{assignedMentor.email}</p>
                )}
              </div>
              {assignedMentor.department && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {assignedMentor.department}
                </Badge>
              )}
            </div>
            {assignedMentor.joinedAt && (
              <p className="text-xs text-muted-foreground">
                Assigned on{" "}
                <span className="font-medium text-foreground">
                  {new Date(assignedMentor.joinedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/protected/discussions/direct/${assignedMentor.mentorId}/${userId}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Open direct chat
              </Link>
              <Link
                href={`/protected/mentor-rooms/group/${assignedMentor.groupId}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/60"
              >
                <Users className="h-3.5 w-3.5" />
                Open group chat
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No mentor assigned yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              The system admin will match you with a mentor soon
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Challenges */}
      {challenges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Current Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {challenges.map((challenge, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs font-medium bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                >
                  {challenge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication Preference */}
      {menteeData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Communication Preference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommPrefSelector initialPref={commPref as "chat" | "call" | "both"} />
          </CardContent>
        </Card>
      )}

      {/* Mentor Background Preference */}
      {menteeData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Looking For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MentorBackgroundEditor initialValue={menteeData.preferred_mentor_background} />
          </CardContent>
        </Card>
      )}

      {/* Mentee Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-sky-500/5 border-blue-500/10">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 divide-x divide-border text-center">
            <div className="px-3">
              <p className="text-2xl font-bold text-blue-500">{challenges.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Challenges</p>
            </div>
            <div className="px-3">
              <p className="text-2xl font-bold text-blue-500">
                {assignedMentor ? "✓" : "–"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Mentor Assigned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
