-- ==========================================================
-- OpenScope Database Schema (PostgreSQL 15+)
-- Open-Source Research Intelligence Platform
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Researchers Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Researcher',
    organization VARCHAR(255) DEFAULT 'Open Intelligence Lab',
    preferences JSONB DEFAULT '{
        "themeDensity": "comfortable",
        "defaultDataSource": "all",
        "autoExtractEntities": true,
        "exportFormat": "markdown"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Investigations / Projects Table
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    topic VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'in_review', 'completed', 'archived')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investigations_topic ON investigations(topic);
CREATE INDEX IF NOT EXISTS idx_investigations_user ON investigations(user_id);

-- 3. Research Sources & Literature Table
CREATE TABLE IF NOT EXISTS research_sources (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    published_date DATE,
    publication_year INT,
    url TEXT NOT NULL,
    doi VARCHAR(255),
    source_repository VARCHAR(100) NOT NULL,
    venue VARCHAR(255),
    citation_count INT DEFAULT 0,
    abstract TEXT,
    source_type VARCHAR(50) DEFAULT 'journal',
    relevance_score NUMERIC(4,3) DEFAULT 0.000,
    sentiment_score NUMERIC(4,3) DEFAULT 0.000,
    is_open_access BOOLEAN DEFAULT TRUE,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_year ON research_sources(publication_year);
CREATE INDEX IF NOT EXISTS idx_sources_citations ON research_sources(citation_count DESC);

-- 4. Junction Table: Investigation Pinned Sources
CREATE TABLE IF NOT EXISTS investigation_sources (
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    source_id VARCHAR(255) REFERENCES research_sources(id) ON DELETE CASCADE,
    pinned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (investigation_id, source_id)
);

-- 5. Extracted Entities Table
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('PERSON', 'ORGANIZATION', 'CONCEPT', 'PAPER', 'TOPIC', 'METHOD')),
    description TEXT,
    wikipedia_url TEXT,
    confidence NUMERIC(4,3) DEFAULT 0.850,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);

-- 6. Knowledge Graph Edges Table
CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    relation_label VARCHAR(100) NOT NULL,
    weight NUMERIC(4,2) DEFAULT 1.0,
    topic_context VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Discovered Findings & Hypotheses Table
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    finding_type VARCHAR(50) DEFAULT 'insight' CHECK (finding_type IN ('insight', 'hypothesis', 'fact', 'question')),
    source_id VARCHAR(255) REFERENCES research_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_findings_investigation ON findings(investigation_id);

-- 8. Timeline Milestones Table
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    event_year INT NOT NULL,
    event_date DATE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Publication',
    significance VARCHAR(20) DEFAULT 'normal' CHECK (significance IN ('high', 'medium', 'normal')),
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investigations_timestamp
BEFORE UPDATE ON investigations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 9. Saved Searches & Query Intelligence History
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    query_text VARCHAR(500) NOT NULL,
    filters JSONB DEFAULT '{}'::jsonb,
    results_count INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_query ON saved_searches(query_text);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created ON saved_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- 10. User Research Memory (Isolated per Firebase UID)
CREATE TABLE IF NOT EXISTS user_memories (
    user_id VARCHAR(255) PRIMARY KEY,
    recent_searches JSONB DEFAULT '[]'::jsonb,
    frequently_researched_topics JSONB DEFAULT '[]'::jsonb,
    saved_paper_count INT DEFAULT 0,
    active_investigation_count INT DEFAULT 0,
    completed_investigation_count INT DEFAULT 0,
    pinned_finding_count INT DEFAULT 0,
    preferred_topics TEXT[] DEFAULT '{}',
    recently_viewed_sources JSONB DEFAULT '[]'::jsonb,
    ui_preferences JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_memories_uid ON user_memories(user_id);

