"use client";

import React, { useState } from "react";
import InterestSelector from "./interest-selector";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  role: string;
  onBack: () => void;
}

export default function ProfileForm({ role, onBack }: ProfileFormProps) {
  const supabase = createClient();
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1");
  const [interests, setInterests] = useState(["Career guidance"]);
  const [languages, setLanguages] = useState("1");
  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [challenges, setChallenges] = useState("");
  const [mentorBackgroundPreference, setMentorBackgroundPreference] = useState("");
  const [communicationPreference, setCommunicationPreference] = useState<"chat" | "call" | "both">("both");
  const [mentoringDomains, setMentoringDomains] = useState("");
  const [pastExperience, setPastExperience] = useState("");
  const [maxMentees, setMaxMentees] = useState("3");
  const [qualification, setQualification] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [specializationAreas, setSpecializationAreas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const roleToRoleId: Record<string, number> = {
    mentee: 1,
    peer: 2,
    senior: 3,
    professional: 6,
  };

  const parseCsvToArray = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const languageId = Number(languages);
  const selectedRoleId = roleToRoleId[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("No authenticated user found. Please login again.");

      if (!selectedRoleId) throw new Error("Invalid role selected.");
      if (!fullName.trim()) throw new Error("Please enter your full name.");

      const email = user.email;
      if (!email) throw new Error("User email not found.");

      const userInsertPayload = {
        id: user.id,
        email,
        password_hash: "managed_by_supabase_auth",
        is_email_verified: Boolean(user.email_confirmed_at),
        status: "active",
        onboarding_status: "profile_complete",
        last_login_at: new Date().toISOString(),
      };

      const { error: usersError } = await supabase
        .from("users")
        .upsert(userInsertPayload, { onConflict: "id" });

      if (usersError) throw usersError;

      const { error: roleError } = await supabase.from("user_roles").upsert(
        {
          user_id: user.id,
          role_id: selectedRoleId,
          is_active: true,
        },
        { onConflict: "user_id,role_id" },
      );

      if (roleError) throw roleError;

      const yearLabelMap: Record<string, string> = {
        "1": "1st year",
        "2": "2nd year",
        "3": "3rd year",
        "4": "4th year",
      };

      const { error: profileError } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          full_name: fullName.trim(),
          college_email: email,
          department,
          year_or_designation: yearLabelMap[year] ?? year,
          short_bio: bio.trim() || null,
          is_complete: true,
        },
        { onConflict: "user_id" },
      );

      if (profileError) throw profileError;

      if (role === "mentee") {
        const { error: menteeError } = await supabase.from("mentee_profiles").upsert(
          {
            user_id: user.id,
            academic_background: "Other",
            current_challenges: challenges.trim() ? parseCsvToArray(challenges) : [],
            preferred_mentor_background: mentorBackgroundPreference.trim() || null,
            preferred_mentor_domain: interests,
            communication_preference: communicationPreference,
          },
          { onConflict: "user_id" },
        );

        if (menteeError) throw menteeError;
      }

      if (role === "peer" || role === "senior") {
        const { error: mentorError } = await supabase
          .from("mentor_ug_pg_profiles")
          .upsert(
            {
              user_id: user.id,
              academic_background: "Other",
              mentoring_domains: mentoringDomains.trim() ? parseCsvToArray(mentoringDomains) : interests,
              past_experience_desc: pastExperience.trim() || null,
              max_mentees: Number(maxMentees) || 3,
              is_accepting_mentees: true,
            },
            { onConflict: "user_id" },
          );

        if (mentorError) throw mentorError;
      }

      if (role === "professional") {
        const { error: professionalError } = await supabase
          .from("professional_profiles")
          .upsert(
            {
              user_id: user.id,
              qualification: qualification.trim() || "Not provided",
              years_of_experience: Number(yearsOfExperience) || 0,
              specialization_areas: specializationAreas.trim() ? parseCsvToArray(specializationAreas) : interests,
              is_emergency_available: false,
              can_escalate_to_external: false,
            },
            { onConflict: "user_id" },
          );

        if (professionalError) throw professionalError;
      }

      if (!Number.isNaN(languageId)) {
        const { error: languageError } = await supabase.from("user_languages").upsert(
          {
            user_id: user.id,
            language_id: languageId,
            proficiency: "fluent",
          },
          { onConflict: "user_id,language_id" },
        );

        if (languageError) throw languageError;
      }

      setSubmitted(true);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="form-container text-center">
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
        <h2 className="form-title">Profile Created!</h2>
        <p className="form-subtitle">
          Welcome to MentorConnect. You&apos;re all set as a <strong>{role}</strong>.
        </p>
        <a href="/protected" className="button" style={{ display: "inline-block", marginTop: "24px", textDecoration: "none" }}>
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div
        onClick={onBack}
        className="mb-5 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
      >
        &lt; Back to roles
      </div>

      <h2 className="form-title">Create Profile</h2>
      <p className="form-subtitle">
        You&apos;re signing up as a <strong>{role}</strong>
      </p>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group form-group--full">
            <label className="label">Full name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Department / branch</label>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="SM">SM</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Year of study</label>
            <select
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Preferred language(s)</label>
            <select
              className="form-control"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            >
              <option value="1">English</option>
              <option value="2">Hindi</option>
              <option value="3">Marathi</option>
              <option value="4">Tamil</option>
            </select>
          </div>
          <div className="form-group" />
        </div>

        <div className="form-group form-group--full">
          <InterestSelector selectedInterests={interests} onChange={setInterests} />
        </div>

        <div className="form-group form-group--full">
          <label className="label">Short bio</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Tell us a bit about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {role === "mentee" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Current challenges</label>
              <input
                type="text"
                className="form-control"
                placeholder="Comma-separated, e.g., Learning React, Time management"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Mentor background preference</label>
              <input
                type="text"
                className="form-control"
                placeholder="E.g., Frontend Developer"
                value={mentorBackgroundPreference}
                onChange={(e) => setMentorBackgroundPreference(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Communication preference</label>
              <select
                className="form-control"
                value={communicationPreference}
                onChange={(e) => setCommunicationPreference(e.target.value as "chat" | "call" | "both")}
              >
                <option value="chat">Chat</option>
                <option value="call">Call</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}

        {(role === "peer" || role === "senior") && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Mentoring domains</label>
              <input
                type="text"
                className="form-control"
                placeholder="Comma-separated, e.g., Web Dev, Algorithms"
                value={mentoringDomains}
                onChange={(e) => setMentoringDomains(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Past experience</label>
              <input
                type="text"
                className="form-control"
                placeholder="Previous hackathons, clubs"
                value={pastExperience}
                onChange={(e) => setPastExperience(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Max mentees</label>
              <input
                type="number"
                className="form-control"
                placeholder="No. of mentees you can handle"
                value={maxMentees}
                min={1}
                max={20}
                onChange={(e) => setMaxMentees(e.target.value)}
              />
            </div>
          </div>
        )}

        {role === "professional" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Qualifications</label>
              <input
                type="text"
                className="form-control"
                placeholder="E.g., M.Tech, PhD"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Years of experience</label>
              <input
                type="number"
                className="form-control"
                placeholder="E.g., 3"
                min={0}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
              />
            </div>
            <div className="form-group form-group--full">
              <label className="label">Specialization areas</label>
              <input
                type="text"
                className="form-control"
                placeholder="Comma-separated, e.g., Counseling, Career guidance"
                value={specializationAreas}
                onChange={(e) => setSpecializationAreas(e.target.value)}
              />
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
