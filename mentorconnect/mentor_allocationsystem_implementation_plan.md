# Mentee-Mentor Demographic Matching Plan

This document outlines a concrete implementation strategy for matching mentees to mentors based on their demographic information, utilizing the existing Supabase database schema.

## User Review Required

> [!IMPORTANT]
> **Matching Logic Placement:** We can implement the matching logic in **TypeScript (Server Action / API Route)** or directly inside **PostgreSQL as an RPC (Remote Procedure Call)**. 
> - **TypeScript** is easier to maintain and test, and lets us easily plug in external ML libraries later.
> - **PostgreSQL RPC** is faster since all data processing happens at the database layer. 
> 
> *Recommendation:* I recommend starting with a **TypeScript Server Action** for the scoring algorithm, as it correlates well with Next.js development patterns. Please let me know if you prefer a database-layer approach.

## 1. Matching Algorithm & Scoring System

The matching engine will evaluate mentors against a mentee's profile and output a score from `0.0` to `1.0`. We will evaluate the following demographic and preference dimensions.

### 1.1 Hard Constraints (Filtering)
Before scoring, mentors who meet any of these criteria are filtered out:
- *Status:* `is_accepting_mentees` is `FALSE` (from `mentor_ug_pg_profiles`).
- *Capacity:* `current_mentees_count` >= `max_mentees`.
- *Role:* Only evaluate users with mentor roles (`role_id` 2, 3, 4, 5).

### 1.2 Scoring Dimensions & Weights
We calculate a weighted sum normalized to 1.0 (or 100%).

| Demographic Feature | Data Sources | Recommended Weight | Explanation |
| :--- | :--- | :--- | :--- |
| **Academic Background** | `mentee.preferred_mentor_background` vs `mentor.academic_background` | **30% (0.3)** | Heaviest weight given if the mentee has a specific background preference. |
| **Mentoring Domains** | `mentee.preferred_mentor_domain` intersection with `mentor.mentoring_domains` | **25% (0.25)** | Measures overlap in focus (e.g., 'academics', 'career'). Score is based on Jaccard similarity or % overlap. |
| **Language Match** | `user_languages` (Mentee vs Mentor) | **20% (0.2)** | Crucial for effective communication. Highest score if Native/Fluent languages overlap. |
| **Department Similarity** | `user_profiles.department` | **15% (0.15)** | Small boost if they belong to the exact same college department. |
| **Shared Interests** | `user_interests` (Mentee vs Mentor) | **10% (0.1)** | Based on intersection of `interest_tags`. |

*Note: Weights can be adjusted based on real-world feedback.*

---

## 2. Proposed Implementation Architecture

### 2.1 Fetching the Data 
We will create a data fetching function `getMatchingCandidates(menteeId: string)` that retrieves:
1. The Mentee's full demographic profile (Profiles, Languages, Interests).
2. A pool of eligible Mentors (Profiles, Languages, Interests), joined correctly based on active statuses.

### 2.2 The Scoring Engine (TypeScript)
A scoring utility that iterates through the eligible mentors and generates a score layout compatible with the `ml_match_predictions` table.

```typescript
// Conceptual interface for the Scoring Engine's output
interface MatchResult {
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
```

### 2.3 Storing Predictions (Database Integration)
To align with the existing schema, top predicted matches will be inserted into the `ml_match_predictions` table:
- `mentee_id`
- `mentor_id`
- `match_score` (e.g., `0.8742`)
- `score_breakdown` (JSONB)
- `model_version` (e.g., `"v1-demographic-heuristic"`)

### 2.4 Action Execution & Mentorship Group
Once a match is generated, the platform has two pathways (both supported by the schema):
1. **Auto-Assign:** The system automatically approves high-score matches, adds the mentee to `mentor_group_members`, and updates `current_mentees_count`.
2. **Review/Committee:** Results sit in `ml_match_predictions` for a committee member to review and approve via `match_approvals`.

---

## 3. UI/UX Workflows

### 3.1 For Committee/Admin (If Review is Required)
- **Match Review Dashboard:** A table showing pending mentees. Clicking a mentee shows the top 3 recommended mentors and their `match_score` breakdown. Admin can click "Approve" or "Assign Override".

### 3.2 For Mentee (If Self-Selection is Allowed)
- **Mentor Recommendations View:** Show the Mentee their top recommended mentors based on the algorithm, explaining *why* they were matched ("Matches your background and 3 interests!").

## Open Questions

> [!WARNING]
> 1. **Data Access Layer**: Are you using **Prisma** or **Supabase Client (supabase-js)** in this application to access the database? 
> 2. **Assignment Workflow**: Should matches be automatically assigned if the score is above a certain threshold (e.g., > 0.8), or should a human (Committee/Admin) manually review and approve every match?
> 3. **Execution**: Would you like to proceed with implementing this matching engine algorithm in TypeScript now?

## Verification Plan

### Automated Tests
- Unit tests for the scoring algorithm utility bypassing database interactions (feed mock mentee and mentor objects, assert correct weighted scores).

### Manual Verification
- Seed the local database with a set of test mentees and mentors with varying demographics.
- Run the matching engine.
- Verify the `ml_match_predictions` table is populated correctly with the expected top mentors having the highest score.
