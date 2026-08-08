# CounselConnect AI Architecture

This document outlines the architecture and integration details of the AI Assistant implemented in the MentorConnect platform.

## Overview
The AI Assistant acts as the first line of contact for mentees. It is a context-aware chatbot that utilizes Retrieval-Augmented Generation (RAG) to provide highly relevant advice, drawing from past resolved issues and matching mentees with suitable mentors.

## Technology Stack
- **Framework:** Next.js (App Router)
- **AI SDK:** Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/google`)
- **LLM Provider:** Google Gemini (`gemini-2.5-flash`)
- **Embeddings:** Google Gemini (`gemini-embedding-2`, 768 dimensions)
- **Database:** Supabase (PostgreSQL) with `pgvector` for vector similarity search
- **Frontend UI:** React, Tailwind CSS, Framer Motion (for animations), React Markdown (for rich text rendering)

## Architecture Components

### 1. Vector Database (Supabase + pgvector)
We use the `pgvector` PostgreSQL extension to store and query dense vector embeddings.
- **Tables:**
  - `issue_embeddings`: Stores vector embeddings of past resolved issues to help the AI learn from historical resolutions.
  - `mentor_embeddings`: Stores vector embeddings of mentor profiles to recommend the best match based on the mentee's current challenge.
- **Dimensionality:** Both tables use `VECTOR(768)` to match the output dimension of Google's Gemini embedding models.
- **Search (Cosine Similarity):** Custom PL/pgSQL RPC functions (`match_issues` and `match_mentors`) perform cosine distance searches to retrieve the most relevant records based on the user's query.

### 2. Embeddings Generation (`lib/embeddings.ts`)
When new issues are resolved or new mentors join, their text content is converted into a 768-dimensional vector using Google's `gemini-embedding-2` model.
- Includes functions for:
  - `generateIssueEmbedding(issueId, content)`
  - `generateMentorEmbedding(mentorId, content)`
  - `getQueryEmbedding(query)` - Used at runtime to embed the user's chat message for vector search.

### 3. RAG Pipeline & Chat Route (`app/api/chat/route.ts`)
When a user sends a message to the AI, the backend follows this Retrieval-Augmented Generation (RAG) pipeline:
1. **Receive:** The Next.js API route receives the chat history.
2. **Embed:** Extracts the user's latest message and converts it into a vector using `getQueryEmbedding()`.
3. **Retrieve:** Queries Supabase using the RPC functions (`match_issues`, `match_mentors`) to find similar past issues and relevant mentors.
4. **Augment:** Injects the retrieved context into the AI's System Prompt. The prompt instructs the AI to be empathetic, practical, and to recommend specific mentors based on the injected context.
5. **Generate & Stream:** Calls `google('gemini-2.5-flash')` with the augmented prompt and streams the response back to the client using `streamText()` and `toUIMessageStreamResponse()`.

### 4. Frontend UI (`components/chat/AiAssistant.tsx`)
A floating chat interface accessible across all protected pages.
- Uses `useChat` from `@ai-sdk/react` (v4+) to manage message state and API communication.
- Maintains local React state for input handling to ensure maximum compatibility.
- Uses `react-markdown` to render the AI's responses with rich text formatting (bolding, lists, code blocks).
- Fully responsive, animated using Framer Motion.

## Environment Variables
The following environment variables must be present in `.env.local` for the AI features to function:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`
- \`GOOGLE_GENERATIVE_AI_API_KEY\` - Must have access to Gemini 2.5 Flash and Gemini Embedding models.

## Future Enhancements
- **Automated Indexing:** Set up Supabase webhooks to automatically call the embedding generation functions whenever an issue status changes to "resolved" or a mentor updates their profile.
- **Conversation History:** Save the ongoing chat threads into a Supabase `chats` table to retain conversation history across sessions.
- **Safety Filters:** Expand upon the existing `content-filter.ts` to implement strict pre-generation and post-generation safety checks.
