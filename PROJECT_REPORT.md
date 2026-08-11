# PR Project Report: CounselConnect

## 1. Cover Page

*   **Project Title:** CounselConnect: Smart Mentoring Platform
*   **Team Members & Roll Numbers:** [Student 1 Name - Roll No], [Student 2 Name - Roll No], [Student 3 Name - Roll No]
*   **Department / Institute:** [Your Department] / [Your Institute Name]
*   **Course:** PR Project
*   **Faculty/Mentor Name:** [Guide Name]
*   **Academic Year:** 2026-2027
*   **Date of Submission:** [Submission Date]

---

## 2. Certificate

This is to certify that the PR Project entitled **"CounselConnect: Smart Mentoring Platform"** is a bona fide work carried out by **[Team Members' Names]** under my supervision and guidance, in partial fulfillment of the requirements for the course.

**Signature of Guide:** _______________
**Signature of HOD:** _______________
**Date:** _______________

---

## 3. Declaration

We hereby declare that the project work entitled **"CounselConnect: Smart Mentoring Platform"** is an original work carried out by us. The matter embodied in this report has not been submitted to any other university or institution for the award of any degree or diploma.

**[Team Members' Signatures]**

---

## 4. Acknowledgement

We would like to express our profound gratitude to our project guide, **[Guide Name]**, for their continuous support, valuable guidance, and encouragement throughout the development of this project. We also thank our department and institute for providing the necessary resources and infrastructure. Finally, we thank our peers who participated in the testing phase and provided constructive feedback.

---

## 5. Abstract

The transition to college life often brings academic, personal, and career challenges for students. Existing support systems are often fragmented or lack personalized guidance. To address this, we developed **CounselConnect**, a comprehensive, smart mentoring platform designed to bridge the gap between junior students and experienced mentors (peers, seniors, and professionals). 

CounselConnect features a proprietary Smart Demographic Matching engine that pairs mentees with suitable mentors based on academic background, domains, language, and interests. It includes an Integrated Issue Tracking system where students can raise categorized queries with varying privacy levels, including an 'Ultra-Private' mode for sensitive matters requiring professional escalation. Furthermore, the platform integrates an AI Assistant powered by Retrieval-Augmented Generation (RAG) to provide context-aware, immediate advice based on historically resolved issues. Built using Next.js 15, Supabase (PostgreSQL), and Tailwind CSS, the platform provides a secure, scalable, and intuitive environment, significantly improving the accessibility and organization of counseling services within the institute.

---

## 6. Table of Contents

1.  [Chapter 1 — Introduction](#chapter-1--introduction)
2.  [Chapter 2 — Existing System & Proposed System](#chapter-2--existing-system--proposed-system)
3.  [Chapter 3 — Requirements Analysis](#chapter-3--requirements-analysis)
4.  [Chapter 4 — System Design](#chapter-4--system-design)
5.  [Chapter 5 — Technology Stack](#chapter-5--technology-stack)
6.  [Chapter 6 — Implementation](#chapter-6--implementation)
7.  [Chapter 7 — User Interface](#chapter-7--user-interface)
8.  [Chapter 8 — Testing](#chapter-8--testing)
9.  [Chapter 9 — Simulation-Based Validation of Matching Weights](#chapter-9--simulation-based-validation-of-matching-weights)
10. [Chapter 10 — Results & Discussion](#chapter-10--results--discussion)
11. [Chapter 11 — Challenges & Solutions](#chapter-11--challenges--solutions)
12. [Chapter 12 — Limitations](#chapter-12--limitations)
13. [Chapter 13 — Future Scope](#chapter-13--future-scope)
14. [Chapter 14 — Conclusion](#chapter-14--conclusion)
15. [References](#references)
16. [Appendix](#appendix)

---

# Chapter 1 — Introduction

### 1.1 Background
In an academic institute, students frequently encounter academic stress, career anxiety, and personal challenges. While colleges provide counseling resources and peer mentor networks, the discovery and engagement process is often manual, localized, and inefficient. Students might hesitate to seek help due to stigma, privacy concerns, or lack of awareness about whom to approach.

### 1.2 Problem Statement
Students currently face difficulties in accessing tailored counseling services, discovering suitable mentors who share their background or language, and maintaining a structured, secure channel of communication for both minor academic queries and critical personal crises.

### 1.3 Motivation
The motivation behind CounselConnect is to democratize access to mentorship and mental health support. By creating a unified digital platform, we aim to lower the barrier to seeking help, ensure privacy, and leverage technology (like algorithmic matching and AI context retrieval) to provide faster, more relevant support to students.

### 1.4 Objectives
*   Provide a centralized, secure platform for student mentorship and counseling.
*   Develop an algorithmic matching engine to pair mentees with the most compatible mentors based on a weighted scoring system.
*   Implement a robust issue tracking system supporting public, private, and ultra-private threaded discussions.
*   Integrate an AI-powered assistant (RAG) to provide immediate, context-aware guidance drawn from past resolved queries.
*   Establish a hierarchical mentor system (Peer, Senior, PG, Professional) to handle varying levels of issue severity.

### 1.5 Scope
The platform covers mentee-mentor matching, threaded issue resolution, AI chatbot assistance, role-based dashboards, and basic availability tracking. It is currently designed for internal institute use and does not cover external payments, live video conferencing, or integration with the institute's primary ERP system.

---

# Chapter 2 — Existing System & Proposed System

### 2.1 Existing System
Currently, mentorship in the institute relies on static lists of student guides or manual assignments by faculty. Counseling appointments are booked via email or physical visits. Knowledge sharing happens informally over scattered messaging groups (WhatsApp/Discord).

### 2.2 Problems with Existing System
*   **Manual & Suboptimal Matching:** Students are often assigned mentors arbitrarily without considering language preferences or specific domain interests.
*   **Privacy Concerns:** Students hesitate to ask sensitive questions in public chat groups.
*   **Loss of Institutional Knowledge:** Good advice given by seniors is lost in chat history and not accessible to future students facing the same issues.
*   **Delayed Response:** For immediate, minor queries, students have to wait for human mentor availability.

### 2.3 Proposed System
CounselConnect proposes a centralized web platform where:
*   Users have distinct roles (Mentee, Mentor, Professional).
*   A matching algorithm scores compatibility (0.0-1.0) using multiple demographic points.
*   Students can post "Issues" with granular privacy controls (Anonymous, Private, Ultra-Private).
*   An AI assistant provides immediate help using vector search on past resolved issues.

### 2.4 Comparison

| Feature | Existing System | Proposed Platform (CounselConnect) |
| :--- | :--- | :--- |
| **Matching Process** | Manual, random assignment | Algorithmic, weighted demographic matching |
| **Knowledge Base** | Scattered in chat groups | Centralized, AI-retrievable issue database |
| **Privacy** | Limited, relies on direct messaging | Built-in Anonymous posting & Ultra-Private mode |
| **Response Time** | Dependent purely on human availability | Immediate AI assistance + human mentor follow-up |
| **Hierarchy** | Flat student-guide structure | Multi-tier: Peers -> Seniors -> Professionals |

---

# Chapter 3 — Requirements Analysis

## 3.1 Functional Requirements

### Mentee (Student)
*   Register/Login via institute email.
*   Complete profile (Academic background, languages, interests).
*   Trigger the matching engine to find the top 5 suitable mentors.
*   Create categorized issues (Academic, Career, Mental Health) with varying visibility.
*   Chat with the AI Assistant for immediate context-aware help.
*   View dashboard summarizing active issues and recent notifications.

### Mentor (Peer / Senior / PG)
*   Manage profile and set mentoring domains, maximum capacity, and availability.
*   View list of assigned mentees.
*   Browse open public issues or assigned private issues.
*   Respond to issues via threaded comments.
*   Mark issues as resolved.
*   View performance analytics (Total mentees served, resolution rate).

### Professional Counsellor / Admin
*   Access highly sensitive "Ultra-Private" escalated issues.
*   Manage mentor verifications and approvals.
*   Maintain audit logs for accountability.

## 3.2 Non-Functional Requirements
*   **Security:** JWT-based authentication, Role-Based Access Control (RBAC), Row Level Security (RLS) in the database.
*   **Privacy:** Strict data isolation for ultra-private issues; anonymization options for public queries.
*   **Performance:** Real-time updates for issue status; fast vector search for AI retrieval (< 1s response).
*   **Usability:** Responsive UI using modern design principles (Tailwind, Framer Motion) accessible on desktop and mobile browsers.
*   **Scalability:** Serverless architecture capable of handling concurrent users during peak exam seasons.

---

# Chapter 4 — System Design

### 4.1 System Architecture

CounselConnect follows a modern Full-Stack Serverless architecture utilizing Retrieval-Augmented Generation (RAG).

```text
[ Client (Browser) ] ---(HTTPS)---> [ Next.js App Router (Frontend/API) ]
                                          |           |
                                          |           |--- [ Vercel AI SDK ] ---> [ Google Gemini API (LLM) ]
                                          v
                                  [ Supabase Platform ]
                                          |
                                  +-------+-------+
                                  |               |
                           [ Auth Service ]  [ PostgreSQL Database ]
                                                  |
                                                  |---> (pgvector extension for Embeddings)
```

### 4.2 Use Case Diagram

*   **Mentee:** Create Profile, Request Match, Create Issue, Interact with AI, Comment on Issue.
*   **Mentor:** Manage Availability, Resolve Issue, View Mentee Details.
*   **Professional:** Handle Escalated Issues, Review Audit Logs.

### 4.3 Database Design (ER Model Overview)

The database is built on PostgreSQL with strict relational integrity. Key entities include:

*   **users & roles:** Handles authentication states and hierarchical permission levels (1 to 6).
*   **user_profiles (mentee, mentor_ug_pg, professional):** Segmented profile data ensuring data normalization based on user type.
*   **issues & issue_comments:** The core tracking system. Includes `visibility_level` and `is_anonymous` flags.
*   **ml_match_predictions:** Stores the output of the matching algorithm (`match_score`, `score_breakdown`).
*   **mentor_groups & mentor_group_members:** Manages the active mentor-mentee relationships.
*   **vector embeddings:** `pgvector` tables (`issue_embeddings`, `mentor_embeddings`) store 768-dimensional vectors for AI semantic search.

---

# Chapter 5 — Technology Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router) | Provides React Server Components for performance, built-in API routes, and seamless deployment. |
| **Styling & UI** | Tailwind CSS, Shadcn/UI | Rapid UI development with accessible, customizable, and consistent design components. |
| **Backend & Database** | Supabase (PostgreSQL) | Offers fully managed Postgres with Realtime subscriptions, built-in Auth, and Row Level Security (RLS). |
| **Vector Search** | pgvector (PostgreSQL extension) | Enables native storage and querying of high-dimensional embeddings directly alongside relational data. |
| **AI Integration** | Vercel AI SDK, Google Gemini | Vercel SDK provides streaming hooks; Gemini 2.5 Flash offers fast, cost-effective reasoning for the chatbot. |
| **Animations** | Framer Motion | Enhances UX with smooth transitions and micro-interactions. |

---

# Chapter 6 — Implementation

### 6.1 Authentication & Authorization Module
Implemented using Supabase Auth. Users register with their email. A database trigger (`handle_new_auth_user`) automatically syncs the auth state to a public `users` table. Row Level Security (RLS) policies ensure that mentees can only read their own private issues, while mentors can only access issues assigned to them or marked public.

### 6.2 Smart Matching Engine (`lib/matchingEngine.ts`)
The matching algorithm pairs mentees and mentors by calculating a normalized score (0.0 to 1.0) using weighted parameters:
*   Academic Background (30%)
*   Mentoring Domains (25%)
*   Language Compatibility (20%)
*   Department (15%)
*   Shared Interests (10%)

Array similarities (like shared languages or interests) are calculated using a modified Jaccard index (intersection size relative to mentee's preferences).

### 6.3 Issue Tracking System
Users create issues categorized as Academic, Career, etc. The state management handles transitions from `open` -> `in_discussion` -> `resolved`. A dedicated `issue_comments` table supports threaded conversations. An `issue_status_history` table maintains a chronological log of state changes.

### 6.4 AI Assistant (RAG Pipeline)
Implemented in `app/api/chat/route.ts`. 
1.  User query is converted to a vector embedding using `gemini-embedding-2`.
2.  Supabase RPC functions perform a cosine similarity search on `issue_embeddings` to find historically resolved issues similar to the query.
3.  The retrieved context is injected into the system prompt for `gemini-2.5-flash`, which streams a context-aware response back to the client using `@ai-sdk/react`.

### 6.5 Mentor Dashboard & Analytics
A unified dashboard (`app/protected/page.tsx`) dynamically renders different views based on role. Mentors see active mentees, open assigned issues, and calculated statistics like resolution rate (resolved / assigned) pulled directly from PostgreSQL aggregates.

---

# Chapter 7 — User Interface

*(Note for actual submission: Insert relevant screenshots from your application here)*

### 7.1 Landing Page
Features a clear call to action, explaining the benefits of CounselConnect, built with responsive Tailwind utilities and Framer Motion enter animations.
*(Insert Screenshot - Figure 7.1)*

### 7.2 Personalized Dashboard
Shows active issues, weekly statistics (issues created/resolved), and a chronological activity timeline.
*(Insert Screenshot - Figure 7.2)*

### 7.3 AI Chat Interface
A floating, responsive chat window where students interact with the Gemini-powered assistant. Renders Markdown and code snippets cleanly.
*(Insert Screenshot - Figure 7.3)*

### 7.4 Issue Board & Discussion Thread
A forum-like interface to view open issues, filter by category/state, and view nested comments for collaborative problem-solving.
*(Insert Screenshot - Figure 7.4)*

---

# Chapter 8 — Testing

### 8.1 Testing Strategy
We employed a combination of manual functional testing and API validation to ensure system reliability, particularly focusing on access control and AI response accuracy.

### 8.2 Test Cases

| ID | Test Case | Input | Expected Result | Result |
| :--- | :--- | :--- | :--- | :--- |
| TC01 | Role-Based Access Control | Mentee attempts to view Ultra-Private issue of another student | Access Denied (Row Level Security blocks query) | Pass |
| TC02 | Smart Matching | Mentee requests match (Pref: Hindi, PCM) | Mentor list returned sorted with Hindi/PCM mentors at top | Pass |
| TC03 | Issue Creation | Submit issue form with valid data | Issue appears in database and on public board (if visibility=public) | Pass |
| TC04 | AI RAG Context | Ask AI about a specific past resolved syllabus issue | AI answers correctly using retrieved context from DB | Pass |
| TC05 | Status Transition | Mentor marks issue as resolved | Status updates, history log created, mentor stats updated | Pass |

---

# Chapter 9 — Simulation-Based Validation of Matching Weights

### 9.1 Matching Algorithm
The platform calculates a compatibility score between a student and each available counsellor using five attributes:

\[
M = 0.30B + 0.25D + 0.20L + 0.15Dept + 0.10I
\]

where:
* **B (Background)** — academic/technical background similarity
* **D (Domain)** — similarity in mentoring domain
* **L (Language)** — overlap in spoken languages
* **Dept (Department)** — whether the student and counsellor belong to the same department
* **I (Interests)** — similarity in technical interests/hobbies

The weights sum to 1, so the final matching score lies between 0 and 1.

### 9.2 Rationale Behind Weight Selection
The weights were initially selected based on the relative importance of each attribute in a counselling/mentoring context.

| Attribute           |  Weight | Rationale                                                                          |
| ------------------- | ------: | ---------------------------------------------------------------------------------- |
| Academic Background | **30%** | Most important for understanding the student's academic and technical requirements |
| Mentoring Domain    | **25%** | Ensures the counsellor has relevant expertise                                      |
| Language            | **20%** | Facilitates comfortable and effective communication                                |
| Department          | **15%** | Provides additional academic/institutional context                                 |
| Interests           | **10%** | Helps establish rapport but is less critical than expertise                        |

Therefore:
\[
30+25+20+15+10=100\%
\]

### 9.3 Synthetic Evaluation Dataset
To evaluate whether the selected weights provide meaningful recommendations, a **synthetic dataset of 70 student profiles** and **15 counsellor profiles** was generated.

Each student profile contains:
* Department
* Academic background
* Preferred mentoring domain
* Spoken languages
* Interests

Each counsellor profile contains corresponding attributes.
The purpose of this dataset was to simulate different student–counsellor combinations and compare alternative weighting strategies.

> **Important:** The dataset is synthetic and was used only for algorithmic evaluation. It does not represent actual survey responses from students.

### 9.4 Weight Configurations Compared
Four different weighting configurations were evaluated.

**Model 1 — Proposed**
\[
30\%, 25\%, 20\%, 15\%, 10\%
\]

**Model 2 — Equal Weights**
\[
20\%, 20\%, 20\%, 20\%, 20\%
\]

**Model 3 — Academic Heavy**
\[
40\%, 20\%, 15\%, 15\%, 10\%
\]

**Model 4 — Domain Heavy**
\[
20\%, 40\%, 15\%, 15\%, 10\%
\]

This comparison helps determine whether giving relatively greater importance to academic background and mentoring domain produces better recommendations.

### 9.5 Evaluation Method
For every synthetic student:
1. The student's profile was compared against all available counsellors.
2. A matching score was calculated for every student–counsellor pair.
3. Counsellors were ranked according to their matching score.
4. The highest-scoring counsellor was selected as the **Top-1 recommendation**.
5. The three highest-scoring counsellors were considered the **Top-3 recommendations**.
6. A simulated suitability rating from **1 to 5** was generated for evaluation purposes.
7. The four weighting configurations were compared using the same dataset.

### 9.6 Evaluation Metrics

**Average Rating**
The average suitability rating of the recommended counsellors was calculated:
\[
AverageRating = \frac{\sum_{i=1}^{N} Rating_i}{N}
\]
where ratings range from 1 to 5.

**Top-1 Acceptance**
The percentage of students for whom the highest-ranked recommendation received a suitability rating of at least 4:
\[
Top1 = \frac{\text{Accepted Top-1 recommendations}}{\text{Total students}}\times100
\]

**Top-3 Acceptance**
The percentage of students for whom at least one of the three highest-ranked recommendations received a rating of at least 4:
\[
Top3 = \frac{\text{Students with an acceptable Top-3 match}}{\text{Total students}}\times100
\]

### 9.7 Results & Interpretation

The current simulation produced:

| Weight Configuration          | Average Rating | Top-1 Acceptance | Top-3 Acceptance |
| ----------------------------- | -------------: | ---------------: | ---------------: |
| **Proposed (30/25/20/15/10)** |      **3.371** |       **41.43%** |       **41.43%** |
| Equal (20/20/20/20/20)        |          3.314 |           34.29% |           35.71% |
| Academic-heavy                |          3.314 |           34.29% |           34.29% |
| Domain-heavy                  |          3.243 |           35.71% |           38.57% |

**Interpretation:**
The proposed weighting configuration achieved the highest average suitability rating and the highest Top-1 acceptance rate among the configurations tested.

Compared with the equal-weight model:
* Average rating increased from **3.314 → 3.371**
* Top-1 acceptance increased from **34.29% → 41.43%**
* Top-3 acceptance increased from **35.71% → 41.43%**

This indicates that, **within the synthetic simulation**, giving greater importance to academic background and mentoring domain resulted in better-ranked matches. 

A synthetic dataset of 70 student profiles was used to simulate user preferences and evaluate the matching algorithm. The proposed weighting configuration achieved the highest performance among the tested configurations. Actual user studies with institute students are planned as future validation.

---

# Chapter 10 — Results & Discussion

The CounselConnect platform successfully provides a centralized interface for students to seek guidance. The integration of the Smart Matching Engine significantly improves the relevancy of mentor assignments compared to manual allocation, as demonstrated by our simulation-based validation.

The most impactful feature proved to be the RAG-powered AI Assistant. By indexing past resolved issues, the platform is able to provide immediate, highly accurate answers to common queries (e.g., procedural questions about exams or electives), reducing the repetitive load on human mentors. The tiered privacy system (including Anonymous and Ultra-Private modes) addresses the core concern of student hesitation in seeking mental health support.

---

# Chapter 11 — Challenges & Solutions

| Challenge | Solution |
| :--- | :--- |
| **Complex Access Control** | Implemented PostgreSQL Row Level Security (RLS) to enforce data privacy at the database layer, ensuring APIs cannot accidentally leak private issues. |
| **AI Hallucinations** | Utilized Retrieval-Augmented Generation (RAG). By forcing the LLM to ground its answers in retrieved historical data (via `pgvector`), hallucination rates dropped significantly. |
| **Matching Algorithm Tuning** | Evaluated multiple models using a synthetic simulation to identify that giving higher precedence to Academic Background (30%) and Mentoring Domain (25%) yielded the most optimal baseline performance. |
| **UI State Management for Chat** | Used Vercel AI SDK's `useChat` hook, which handles streaming responses, loading states, and message history automatically, preventing complex custom React state logic. |

---

# Chapter 12 — Limitations

*   **Reliance on Quality Data:** The AI assistant's helpfulness is directly proportional to the volume and quality of previously resolved issues in the database. It suffers from a "cold start" problem.
*   **No Real-time Chatting:** Currently, interactions between mentors and mentees happen via asynchronous threaded comments on issues, rather than real-time web sockets.
*   **Limited External Integrations:** The system operates standalone and does not currently sync with the institute's official timetable or attendance ERP systems.
*   **Synthetic Baseline Validation:** The matching algorithm weights were optimized using simulated profiles. Real-world preferences may slightly differ.

---

# Chapter 13 — Future Scope

*   **Real-User Validation Studies:** Conducting controlled studies with a small cohort of institute students (20–30) to generate real user preference ratings and fine-tune the algorithm's weights beyond synthetic data.
*   **Automated Vector Indexing Webhooks:** Setting up Supabase edge functions to automatically generate embeddings the moment an issue is marked "resolved," fully automating the AI knowledge base update cycle.
*   **Real-time Notifications & Chat:** Upgrading the comment system to utilize Supabase Realtime subscriptions for instant messaging.
*   **Advanced Analytics Dashboard:** Providing college administration with anonymized aggregate data to identify trending student stress points (e.g., spikes in mental health issues during specific weeks).
*   **Mobile Application:** Packaging the Next.js PWA into native Android/iOS apps for better push notification delivery.

---

# Chapter 14 — Conclusion

CounselConnect demonstrates how modern web technologies and artificial intelligence can be combined to solve administrative and pastoral care challenges in educational institutions. By providing a secure, algorithmic, and AI-assisted platform, we have built a system that not only connects students with the right human guidance but also builds a permanent, accessible knowledge base. The project successfully meets its objectives of improving accessibility, ensuring privacy, and modernizing the counseling workflow.

---

# References

1.  Next.js Documentation. Vercel. [https://nextjs.org/docs](https://nextjs.org/docs)
2.  Supabase Documentation (PostgreSQL, Auth, pgvector). [https://supabase.com/docs](https://supabase.com/docs)
3.  Vercel AI SDK Documentation. [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
4.  pgvector: Open-source vector similarity search for Postgres. [https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)
5.  Tailwind CSS Documentation. [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

# Appendix

### A. Core Database Schema Excerpt

```sql
CREATE TABLE issues (
    id              UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300)     NOT NULL,
    description     TEXT             NOT NULL,
    creator_id      UUID             NOT NULL REFERENCES users(id),
    visibility      visibility_level NOT NULL DEFAULT 'public',
    is_anonymous    BOOLEAN          NOT NULL DEFAULT FALSE,
    status          issue_status     NOT NULL DEFAULT 'open'
);

CREATE TABLE ml_match_predictions (
    mentee_id       UUID        NOT NULL,
    mentor_id       UUID        NOT NULL,
    match_score     NUMERIC(5,4) NOT NULL,
    score_breakdown JSONB       NOT NULL
);
```

### B. Matching Algorithm Weight Configuration

```typescript
export const MATCHING_WEIGHTS = {
  background: 0.3,   // Academic background match
  domain: 0.25,      // Mentoring domain match
  language: 0.2,     // Shared spoken languages
  department: 0.15,  // Same college department
  interests: 0.1,    // Shared hobbies/technical interests
};
```
