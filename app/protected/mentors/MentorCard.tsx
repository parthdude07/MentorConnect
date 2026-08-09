"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Users,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MentorCardData } from "@/app/actions/mentors";

interface MentorCardProps {
  mentor: MentorCardData;
  currentUserId: string;
  index: number;
}

const gradients = [
  "from-blue-600 via-blue-500 to-sky-400",
  "from-sky-500 via-cyan-500 to-blue-400",
  "from-indigo-500 via-blue-500 to-sky-500",
  "from-blue-500 via-indigo-500 to-blue-600",
  "from-sky-600 via-blue-500 to-indigo-500",
  "from-cyan-500 via-sky-500 to-blue-500",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-muted-foreground italic">No ratings</span>;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-foreground ml-1">
        {rating.toFixed(1)}
      </span>
      </div>
  );
}

export function MentorCard({ mentor, currentUserId, index }: MentorCardProps) {
  const gradient = gradients[index % gradients.length];
  const initials = getInitials(mentor.name);
  const chatHref = `/protected/discussions/direct/${mentor.id}/${currentUserId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1">
        {/* Gradient strip */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />

        <div className="p-5 space-y-4">
          {/* Header: Avatar + Name + Status */}
          <div className="flex items-start gap-3.5">
            <div
              className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}
            >
              {initials}
              {/* Availability dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${
                  mentor.isAcceptingMentees ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                {mentor.name}
              </h3>
              {mentor.department && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {mentor.department}
                </p>
              )}
              {mentor.designation && (
                <p className="text-xs text-muted-foreground/70 truncate">
                  {mentor.designation}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] flex-shrink-0 ${
                mentor.isAcceptingMentees
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400"
                  : "bg-zinc-500/10 text-zinc-500 border-zinc-400/25"
              }`}
            >
              {mentor.isAcceptingMentees ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Available</>
              ) : (
                "Unavailable"
              )}
            </Badge>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {mentor.bio}
            </p>
          )}

          {/* Mentoring Domains */}
          {mentor.mentoringDomains.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mentor.mentoringDomains.slice(0, 4).map((domain) => (
                <Badge
                  key={domain}
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-primary/8 text-primary border-0"
                >
                  {domain}
                </Badge>
              ))}
              {mentor.mentoringDomains.length > 4 && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border-0"
                >
                  +{mentor.mentoringDomains.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-sm font-bold text-foreground">
                  {mentor.issuesResolved}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Issues Solved
              </p>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm font-bold text-foreground">
                  {mentor.totalMenteesServed}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Mentees Served
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm font-bold text-foreground">
                  {mentor.activeMentees}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Active Now
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <RatingStars rating={mentor.avgRating} />
            {mentor.totalRatingsCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {mentor.totalRatingsCount} review{mentor.totalRatingsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Action: Message */}
          <Link
            href={chatHref}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary/90 to-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:from-primary hover:to-primary/90 active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
