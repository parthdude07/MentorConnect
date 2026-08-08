-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table to store embeddings for past resolved issues
CREATE TABLE IF NOT EXISTS issue_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(768), -- 768 is the dimension for Gemini text-embedding-004
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster cosine distance searching
CREATE INDEX ON issue_embeddings USING hnsw (embedding vector_cosine_ops);

-- Create table to store embeddings for mentor profiles
CREATE TABLE IF NOT EXISTS mentor_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster cosine distance searching
CREATE INDEX ON mentor_embeddings USING hnsw (embedding vector_cosine_ops);

-- Function to search for similar issues
CREATE OR REPLACE FUNCTION match_issues(query_embedding VECTOR(768), match_threshold FLOAT, match_count INT)
RETURNS TABLE (
    issue_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ie.issue_id,
        ie.content,
        1 - (ie.embedding <=> query_embedding) AS similarity
    FROM issue_embeddings ie
    WHERE 1 - (ie.embedding <=> query_embedding) > match_threshold
    ORDER BY ie.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search for similar mentors
CREATE OR REPLACE FUNCTION match_mentors(query_embedding VECTOR(768), match_threshold FLOAT, match_count INT)
RETURNS TABLE (
    mentor_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        me.mentor_id,
        me.content,
        1 - (me.embedding <=> query_embedding) AS similarity
    FROM mentor_embeddings me
    WHERE 1 - (me.embedding <=> query_embedding) > match_threshold
    ORDER BY me.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
