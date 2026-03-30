"use server";

import { createClient } from "@/lib/supabase/server";
import { generateMatchMatches, MenteeProfile, MentorProfile } from "@/lib/matchingEngine";

export async function runMatchingAlgorithm(menteeId: string) {
  const supabase = await createClient();

  // 1. Fetch Mentee Profile details
  const { data: menteeData, error: menteeError } = await supabase
    .from("mentee_profiles")
    .select(`
      user_id,
      academic_background,
      preferred_mentor_background,
      preferred_mentor_domain
    `)
    .eq("user_id", menteeId)
    .single();

  if (menteeError || !menteeData) {
    throw new Error("Failed to fetch mentee profile: " + menteeError?.message);
  }

  // Fetch mentee's general profile (for department)
  const { data: menteeProfileData } = await supabase
    .from("user_profiles")
    .select("department")
    .eq("user_id", menteeId)
    .single();

  // 2. Fetch Mentee Attributes (Languages & Interests)
  const [{ data: menteeLangs }, { data: menteeTags }] = await Promise.all([
    supabase.from("user_languages").select("languages(code)").eq("user_id", menteeId),
    supabase.from("user_interests").select("tag_id").eq("user_id", menteeId)
  ]);

  const menteeLanguages = (menteeLangs || []).map((l: any) => l.languages.code as string);
  const menteeInterests = (menteeTags || []).map((t) => t.tag_id as number);

  // Reconstruct Mentee
  const mentee: MenteeProfile = {
    id: menteeData.user_id,
    academic_background: menteeData.academic_background,
    preferred_mentor_background: menteeData.preferred_mentor_background,
    preferred_mentor_domain: menteeData.preferred_mentor_domain || [],
    department: menteeProfileData?.department || null,
    languages: menteeLanguages,
    interests: menteeInterests,
  };

  // 3. Fetch Mentor Profiles
  // For v1, let's fetch UG/PG mentors who are accepting mentees
  const { data: mentorsData, error: mentorsError } = await supabase
    .from("mentor_ug_pg_profiles")
    .select(`
      user_id,
      academic_background,
      mentoring_domains,
      max_mentees,
      current_mentees_count,
      is_accepting_mentees
    `)
    .eq("is_accepting_mentees", true);

  if (mentorsError || !mentorsData) {
    throw new Error("Failed to fetch mentors: " + mentorsError?.message);
  }

  // 4. Extract all Mentors Attributes (We'll do an `in` query for efficiency)
  const mentorIds = mentorsData.map(m => m.user_id);
  const [{ data: mentorLangs }, { data: mentorTags }, { data: mentorGeneralProfiles }] = await Promise.all([
    supabase.from("user_languages").select("user_id, languages(code)").in("user_id", mentorIds),
    supabase.from("user_interests").select("user_id, tag_id").in("user_id", mentorIds),
    supabase.from("user_profiles").select("user_id, department").in("user_id", mentorIds)
  ]);

  // Create a map of mentor general profiles for quick access
  const mentorDepartments = new Map(
      (mentorGeneralProfiles || []).map(p => [p.user_id, p.department])
  );

  // Map them properly
  const mentorsMap = new Map<string, MentorProfile>();
  for (const row of mentorsData) {
    mentorsMap.set(row.user_id, {
      id: row.user_id,
      academic_background: row.academic_background,
      mentoring_domains: row.mentoring_domains || [],
      max_mentees: row.max_mentees,
      current_mentees_count: row.current_mentees_count,
      is_accepting_mentees: row.is_accepting_mentees,
      department: mentorDepartments.get(row.user_id) || null,
      languages: [],
      interests: []
    });
  }

  // Populate Languages
  for (const item of (mentorLangs || [])) {
    const lang = item as any;
    const prof = mentorsMap.get(lang.user_id);
    if (prof && lang.languages?.code) {
        prof.languages.push(lang.languages.code);
    } else if (prof && Array.isArray(lang.languages) && lang.languages[0]?.code) {
        prof.languages.push(lang.languages[0].code);
    }
  }

  // Populate Tags
  for (const item of (mentorTags || [])) {
    const tag = item as any;
    const prof = mentorsMap.get(tag.user_id);
    if (prof) {
        prof.interests.push(tag.tag_id);
    }
  }

  // Convert map to array
  const mentors = Array.from(mentorsMap.values());

  // 5. Generate Match Scores
  const results = generateMatchMatches(mentee, mentors);

  // 6. Limit to top 5 and store in ml_match_predictions
  const topResults = results.slice(0, 5);

  if (topResults.length === 0) {
    return { success: true, count: 0, message: "No mentors found meeting the criteria." };
  }

  const inserts = topResults.map(r => ({
      mentee_id: r.menteeId,
      mentor_id: r.mentorId,
      match_score: r.matchScore,
      score_breakdown: r.scoreBreakdown,
      model_version: "v1-demographic-heuristic"
  }));

  // Upsert the results to handle unique constraint (mentee_id, mentor_id, model_version)
  const { error: insertError } = await supabase
      .from("ml_match_predictions")
      .upsert(inserts, { onConflict: 'mentee_id, mentor_id, model_version' });

  if (insertError) {
    console.error("Failed to insert predictions", insertError);
    throw new Error("Failed to store match predictions: " + insertError.message);
  }

  return { success: true, count: topResults.length, data: topResults };
}
