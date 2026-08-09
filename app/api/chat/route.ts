import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { getQueryEmbedding } from '@/lib/embeddings';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Extract plain text from a UIMessage (v7 format uses parts)
function extractTextFromMessage(message: any): string {
  // v7 UIMessage format: parts array with { type: 'text', text: '...' }
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  }
  // Fallback: older format with content string
  if (typeof message.content === 'string') {
    return message.content;
  }
  return '';
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the latest user message text
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const latestText = lastUserMessage ? extractTextFromMessage(lastUserMessage) : '';

    if (!latestText) {
      return new Response("Missing message", { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get embedding for the user's latest query
    let queryEmbedding: number[] | null = null;
    try {
      queryEmbedding = await getQueryEmbedding(latestText);
    } catch (embeddingError) {
      console.error("Embedding generation failed, proceeding without RAG context:", embeddingError);
    }

    // 2. Query Supabase for similar past issues and mentors (only if embedding succeeded)
    let matchedIssues: any[] = [];
    let matchedMentors: any[] = [];

    if (queryEmbedding) {
      const { data: issues, error: issuesError } = await supabase.rpc('match_issues', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 3
      });
      if (issuesError) {
        console.error("Supabase RPC error for match_issues:", issuesError);
      } else {
        matchedIssues = issues || [];
      }

      const { data: mentors, error: mentorsError } = await supabase.rpc('match_mentors', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 2
      });
      if (mentorsError) {
        console.error("Supabase RPC error for match_mentors:", mentorsError);
      } else {
        matchedMentors = mentors || [];
      }
    }

    // 3. Construct Context for the AI
    let contextText = "--- PAST RESOLVED ISSUES THAT ARE SIMILAR ---\n";
    if (matchedIssues.length > 0) {
      matchedIssues.forEach((issue: any) => {
        contextText += `- ${issue.content}\n`;
      });
    } else {
      contextText += `- [RESOLVED] Issue: Student feeling extremely overwhelmed with coursework and failing grades. Escalated to: Academic Advisor. Resolution: Created a balanced study schedule and arranged weekly check-ins.\n`;
      contextText += `- [RESOLVED] Issue: Mentee reported ongoing conflict and miscommunication with a project team member. Escalated to: Peer Counsellor. Resolution: Mediated a discussion between the students to establish group guidelines.\n`;
      contextText += `- [RESOLVED] Issue: Student experiencing severe anxiety, panic attacks, and sleep deprivation. Escalated to: Professional Counsellor (Ultra-Private). Resolution: Provided CBT techniques and scheduled ongoing weekly counselling sessions.\n`;
    }

    contextText += "\n--- RECOMMENDED MENTORS / COUNSELLORS ---\n";
    if (matchedMentors.length > 0) {
      matchedMentors.forEach((mentor: any) => {
        contextText += `- ${mentor.content}\n`;
      });
    } else {
      contextText += "No specific mentors matched based on vector similarity.\n";
    }

    // 4. Create the System Prompt
    const systemPrompt = `
You are the CounselConnect AI Assistant, the first line of contact for mentees facing academic, career, or personal challenges.
Your goal is to guide them, advise them on immediate steps, and suggest whom they should talk to next.

You are context-aware. Use the following retrieved data from the platform to inform your response:

${contextText}

Instructions:
1. Be extremely empathetic and professional.
2. If the user mentions self-harm, severe depression, or abuse, strongly urge them to select the "Ultra-Private" issue visibility to immediately loop in a Professional Counsellor.
3. Escalate issues based on severity and context: 
   - Academic/coursework/career issues -> Suggest escalating to an Academic Advisor or Mentor.
   - Interpersonal/peer conflicts -> Suggest escalating to a Peer Counsellor.
   - Mental health/anxiety/depression -> Suggest escalating to a Professional Counsellor immediately.
   Review the "PAST RESOLVED ISSUES" to see how similar issues were successfully escalated, and suggest a similar path to the user.
4. Keep your advice practical.
5. Reference the recommended mentors/counsellors if they seem like a good fit for the mentee's problem.
    `;

    // 5. Convert UIMessages to model messages and stream via Gemini
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
