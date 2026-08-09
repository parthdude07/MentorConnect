"use client";

import { useState, useTransition, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Award,
  GraduationCap,
  Briefcase,
  Star,
  TrendingUp,
  Loader2,
  X,
  Plus,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleMentorAvailability, updateMentoringDomains } from "@/app/actions/profile";

interface MentorUGPGProfile {
  mentoring_domains: string[] | null;
  past_experience_desc: string | null;
  max_mentees: number | null;
  current_mentees_count: number | null;
  is_accepting_mentees: boolean | null;
}

interface ProfessionalProfile {
  qualification: string | null;
  years_of_experience: number | null;
  specialization_areas: string[] | null;
  is_emergency_available: boolean | null;
}

interface MentorProfileSectionProps {
  mentorProfile: MentorUGPGProfile | null;
  professionalProfile: ProfessionalProfile | null;
  menteeCount: number;
  isMentorType: "ug_pg" | "professional";
}

// ─── Capacity Bar ──────────────────────────────────────────────────────────────
function CapacityBar({ current, max }: { current: number; max: number }) {
  const safeMax = max || 1;
  const percent = Math.min((current / safeMax) * 100, 100);
  const color =
    percent >= 90
      ? "from-red-500 to-red-400"
      : percent >= 60
        ? "from-yellow-500 to-amber-400"
        : "from-emerald-500 to-teal-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mentees assigned</span>
        <span className="font-semibold text-foreground">
          {current} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      {percent >= 90 && (
        <p className="text-xs text-amber-500 font-medium">
          ⚠️ Nearing capacity — consider increasing your limit
        </p>
      )}
    </div>
  );
}

// ─── Availability Toggle ───────────────────────────────────────────────────────
function AvailabilityToggle({ initialValue }: { initialValue: boolean }) {
  const [isAccepting, setIsAccepting] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<"saved" | null>(null);

  const handleToggle = () => {
    const next = !isAccepting;
    startTransition(async () => {
      const result = await toggleMentorAvailability(next);
      if (result.success) {
        setIsAccepting(next);
        setFlash("saved");
        setTimeout(() => setFlash(null), 2500);
      }
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          {isAccepting ? "Accepting new mentees" : "Not accepting mentees"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAccepting
            ? "You are visible in the matching pool"
            : "You are hidden from matching"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {flash === "saved" && (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-emerald-500 font-medium"
            >
              Saved ✓
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="relative inline-flex items-center transition-all disabled:opacity-60"
          aria-label="Toggle availability"
        >
          {isPending ? (
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          ) : isAccepting ? (
            <ToggleRight className="h-8 w-8 text-emerald-500" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Editable Mentoring Domains ────────────────────────────────────────────────
function MentoringDomainsEditor({ initialDomains }: { initialDomains: string[] }) {
  const [domains, setDomains] = useState<string[]>(initialDomains || []);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const saveDomains = (updated: string[]) => {
    startTransition(async () => {
      const result = await updateMentoringDomains(updated);
      if (result.success) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Failed to save.");
        setTimeout(() => setStatus("idle"), 3000);
      }
    });
  };

  const addDomain = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || domains.includes(trimmed)) {
      setInputValue("");
      return;
    }
    const updated = [...domains, trimmed];
    setDomains(updated);
    setInputValue("");
    saveDomains(updated);
  };

  const removeDomain = (idx: number) => {
    const updated = domains.filter((_, i) => i !== idx);
    setDomains(updated);
    saveDomains(updated);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDomain();
    }
    if (e.key === "Backspace" && inputValue === "" && domains.length > 0) {
      removeDomain(domains.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Status line */}
      <div className="flex items-center gap-2 min-h-[1rem]">
        <AnimatePresence>
          {status === "saved" && (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-emerald-500 font-medium"
            >
              <Check className="h-3 w-3" /> Saved
            </motion.span>
          )}
          {status === "error" && (
            <motion.span
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500"
            >
              {errorMsg}
            </motion.span>
          )}
          {isPending && (
            <Loader2 key="loading" className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </AnimatePresence>
      </div>

      {/* Tag pill list */}
      <div
        className="flex flex-wrap gap-2 min-h-[2rem] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {domains.map((domain, idx) => (
            <motion.span
              key={domain}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-medium text-primary"
            >
              {domain}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeDomain(idx); }}
                disabled={isPending}
                className="ml-0.5 rounded-full hover:bg-primary/20 transition-colors p-0.5 disabled:opacity-40"
                aria-label={`Remove ${domain}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {domains.length === 0 && !inputValue && (
          <span className="text-xs text-muted-foreground italic self-center">
            No domains yet — add some below
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a domain and press Enter…"
          disabled={isPending}
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addDomain}
          disabled={isPending || !inputValue.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 text-primary px-3 py-2 text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] border border-border">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] border border-border">,</kbd> to add · Click{" "}
        <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] border border-border">×</kbd> to remove
      </p>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export function MentorProfileSection({
  mentorProfile,
  professionalProfile,
  menteeCount,
  isMentorType,
}: MentorProfileSectionProps) {
  const isUGPG = isMentorType === "ug_pg";
  const staticDomains = isUGPG
    ? mentorProfile?.mentoring_domains ?? []
    : professionalProfile?.specialization_areas ?? [];

  const maxMentees = mentorProfile?.max_mentees ?? 5;
  const currentMentees = mentorProfile?.current_mentees_count ?? menteeCount;
  const isAccepting = mentorProfile?.is_accepting_mentees ?? false;

  // Static domain count for stats card
  const domainCount = staticDomains.length;

  return (
    <div className="space-y-4">
      {/* ── Availability Toggle ── */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Star className="h-4 w-4" />
            Availability Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUGPG && mentorProfile ? (
            <AvailabilityToggle initialValue={isAccepting} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Emergency available:{" "}
              <Badge variant={professionalProfile?.is_emergency_available ? "default" : "secondary"}>
                {professionalProfile?.is_emergency_available ? "Yes" : "No"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mentee Capacity ── */}
      {isUGPG && mentorProfile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Mentee Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityBar current={currentMentees} max={maxMentees} />
          </CardContent>
        </Card>
      )}

      {/* ── Mentoring Domains (editable for UG/PG) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {isUGPG ? "Mentoring Domains" : "Specialization Areas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUGPG ? (
            <MentoringDomainsEditor
              initialDomains={staticDomains}
            />
          ) : (
            /* Professional: read-only specialization badges */
            staticDomains.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {staticDomains.map((domain, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No specialization areas set.</p>
            )
          )}
        </CardContent>
      </Card>

      {/* ── Past Experience ── */}
      {isUGPG && mentorProfile?.past_experience_desc && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Past Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mentorProfile.past_experience_desc}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Professional Credentials ── */}
      {!isUGPG && professionalProfile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Professional Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {professionalProfile.qualification && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Qualification</span>
                  <p className="font-medium">{professionalProfile.qualification}</p>
                </div>
              </div>
            )}
            {typeof professionalProfile.years_of_experience === "number" && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Experience</span>
                  <p className="font-medium">
                    {professionalProfile.years_of_experience} year
                    {professionalProfile.years_of_experience !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Stats Summary ── */}
      <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/10">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            <div className="px-3">
              <p className="text-2xl font-bold text-primary">{currentMentees}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Mentees</p>
            </div>
            <div className="px-3">
              <p className="text-2xl font-bold text-primary">{domainCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Domains</p>
            </div>
            <div className="px-3">
              <p className="text-2xl font-bold text-primary">
                {isAccepting ? "✓" : "✗"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Accepting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
