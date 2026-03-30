"use client";

import React, { useState } from "react";
import InterestSelector from "./interest-selector";

interface ProfileFormProps {
  role: string;
  onBack: () => void;
}

export default function ProfileForm({ role, onBack }: ProfileFormProps) {
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1");
  const [interests, setInterests] = useState<string[]>(["Career guidance"]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [academicBackground, setAcademicBackground] = useState("PCM");
  const [preferredDomains, setPreferredDomains] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = { role, department, year, interests, languages, academicBackground, preferredDomains };
    console.log("Profile submitted:", formData);
    // TODO: save profile to Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
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
        style={{ cursor: "pointer", color: "#aaaaaa", fontSize: "14px", marginBottom: "20px" }}
      >
        &lt; Back to roles
      </div>

      <h2 className="form-title">Create Profile</h2>
      <p className="form-subtitle">
        You&apos;re signing up as a <strong>{role}</strong>
      </p>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* GENERAL FIELDS */}
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
            <label className="label">Academic Background</label>
            <select
              className="form-control"
              value={academicBackground}
              onChange={(e) => setAcademicBackground(e.target.value)}
            >
              <option value="PCM">PCM</option>
              <option value="PCB">PCB</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Diploma">Diploma</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Preferred language(s) (Hold Ctrl/Cmd to select multiple)</label>
            <select
              multiple
              className="form-control"
              value={languages}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setLanguages(selected);
              }}
              style={{ minHeight: "100px" }}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="Tamil">Tamil</option>
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
          />
        </div>

        {/* ROLE SPECIFIC FIELDS */}
        {role === "mentee" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Current challenges</label>
              <input type="text" className="form-control" placeholder="E.g., Learning React" />
            </div>
            <div className="form-group">
              <label className="label">Mentor background preference</label>
              <input type="text" className="form-control" placeholder="E.g., Frontend Developer" />
            </div>
            <div className="form-group">
              <label className="label">Domains you need help with</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="E.g., Web Dev, Mental Health" 
                value={preferredDomains}
                onChange={(e) => setPreferredDomains(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Communication preference</label>
              <select className="form-control">
                <option value="1">Chat</option>
                <option value="2">Call</option>
                <option value="3">In-person</option>
              </select>
            </div>
          </div>
        )}

        {(role === "peer" || role === "senior") && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Mentoring domains</label>
              <input type="text" className="form-control" placeholder="E.g., Web Dev, Algorithms" />
            </div>
            <div className="form-group">
              <label className="label">Past experience</label>
              <input type="text" className="form-control" placeholder="Previous hackathons, clubs" />
            </div>
            <div className="form-group">
              <label className="label">Max mentees</label>
              <input type="number" className="form-control" placeholder="No. of mentees you can handle" />
            </div>
          </div>
        )}

        {role === "professional" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Qualifications</label>
              <input type="text" className="form-control" placeholder="E.g., B.Tech, AWS Certified" />
            </div>
            <div className="form-group">
              <label className="label">Years of experience</label>
              <input type="number" className="form-control" placeholder="E.g., 3" />
            </div>
            <div className="form-group form-group--full">
              <label className="label">Specialization areas</label>
              <input type="text" className="form-control" placeholder="E.g., UI/UX, Cloud Architecture" />
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
