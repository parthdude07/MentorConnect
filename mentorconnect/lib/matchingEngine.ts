export interface MenteeProfile {
  id: string; // user_id
  academic_background: string;
  preferred_mentor_background: string | null;
  preferred_mentor_domain: string[];
  department?: string | null;
  languages: string[]; // language codes or names
  interests: number[]; // tag IDs
}

export interface MentorProfile {
  id: string; // user_id
  academic_background: string;
  mentoring_domains: string[];
  max_mentees: number;
  current_mentees_count: number;
  is_accepting_mentees: boolean;
  department?: string | null;
  languages: string[]; // language codes or names
  interests: number[]; // tag IDs
}

export interface MatchResult {
  mentorId: string;
  menteeId: string;
  matchScore: number;
  scoreBreakdown: {
    background: number;
    domain: number;
    language: number;
    department: number;
    interests: number;
  };
}

export const MATCHING_WEIGHTS = {
  background: 0.3,
  domain: 0.25,
  language: 0.2,
  department: 0.15,
  interests: 0.1,
};

function arraySimilarity<T>(arr1: T[] | null | undefined, arr2: T[] | null | undefined): number {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const intersectionSize = [...set1].filter(x => set2.has(x)).length;
  if (intersectionSize === 0) return 0;
  
  // Calculate similarity as intersection size / max array length (overlap representation)
  // or Jaccard index. Let's use intersection relative to the mentee's preferences
  return intersectionSize / set1.size;
}

export function generateMatchMatches(mentee: MenteeProfile, mentors: MentorProfile[]): MatchResult[] {
  const results: MatchResult[] = [];

  for (const mentor of mentors) {
    if (!mentor.is_accepting_mentees || mentor.current_mentees_count >= mentor.max_mentees) {
      continue;
    }

    // 1. Background Score (0 to 1)
    let backgroundScore = 0;
    if (mentee.preferred_mentor_background) {
      backgroundScore = mentee.preferred_mentor_background === mentor.academic_background ? 1.0 : 0.0;
    } else {
      // If no explicit preference is set, score based on exact background match
      backgroundScore = mentee.academic_background === mentor.academic_background ? 0.8 : 0.4;
    }

    // 2. Domain Score (0 to 1)
    const domainScore = arraySimilarity(mentee.preferred_mentor_domain, mentor.mentoring_domains);

    // 3. Language Score (0 to 1)
    const languageScore = arraySimilarity(mentee.languages, mentor.languages);

    // 4. Department Score (0 to 1)
    let departmentScore = 0;
    if (mentee.department && mentor.department && mentee.department === mentor.department) {
      departmentScore = 1.0;
    }

    // 5. Interests Score (0 to 1)
    const interestsScore = arraySimilarity(mentee.interests, mentor.interests);

    const finalScore = (
      backgroundScore * MATCHING_WEIGHTS.background +
      domainScore * MATCHING_WEIGHTS.domain +
      languageScore * MATCHING_WEIGHTS.language +
      departmentScore * MATCHING_WEIGHTS.department +
      interestsScore * MATCHING_WEIGHTS.interests
    );

    // Filter out completely terrible matches
    if (finalScore > 0) {
      results.push({
        mentorId: mentor.id,
        menteeId: mentee.id,
        matchScore: Number(finalScore.toFixed(4)),
        scoreBreakdown: {
          background: Number((backgroundScore * MATCHING_WEIGHTS.background).toFixed(4)),
          domain: Number((domainScore * MATCHING_WEIGHTS.domain).toFixed(4)),
          language: Number((languageScore * MATCHING_WEIGHTS.language).toFixed(4)),
          department: Number((departmentScore * MATCHING_WEIGHTS.department).toFixed(4)),
          interests: Number((interestsScore * MATCHING_WEIGHTS.interests).toFixed(4)),
        }
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
