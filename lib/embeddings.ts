import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { createClient } from "@/lib/supabase/server";

const embeddingModel = google.embedding("gemini-embedding-2");

export async function generateIssueEmbedding(issueId: string, issueContent: string) {
  try {
    const supabase = await createClient();
    
    // Generate the embedding using Gemini
    const { embedding } = await embed({
      model: embeddingModel,
      value: issueContent,
    });

    // Store in database
    const { error } = await supabase.from("issue_embeddings").insert({
      issue_id: issueId,
      content: issueContent,
      embedding,
    });

    if (error) {
      console.error("Failed to insert issue embedding into DB:", error);
      throw new Error(`DB Insert Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error generating issue embedding:", error);
    throw error;
  }
}

export async function generateMentorEmbedding(mentorId: string, mentorProfileContent: string) {
  try {
    const supabase = await createClient();
    
    // Generate the embedding using Gemini
    const { embedding } = await embed({
      model: embeddingModel,
      value: mentorProfileContent,
    });

    // Store in database
    const { error } = await supabase.from("mentor_embeddings").insert({
      mentor_id: mentorId,
      content: mentorProfileContent,
      embedding,
    });

    if (error) {
      console.error("Failed to insert mentor embedding into DB:", error);
      throw new Error(`DB Insert Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error generating mentor embedding:", error);
    throw error;
  }
}

export async function getQueryEmbedding(query: string) {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: query,
    });
    return embedding;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw error;
  }
}
