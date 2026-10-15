import { Pool } from 'pg';
import { Investigation, ResearchSource, Finding } from '../types';
import { INITIAL_INVESTIGATIONS } from '../lib/researchData';

let pgPool: Pool | null = null;
let isPgAvailable = false;
let fallbackStore: Investigation[] = JSON.parse(JSON.stringify(INITIAL_INVESTIGATIONS));
let savedSearchesStore: Array<{ id: string; query: string; resultsCount: number; createdAt: string; metadata?: any }> = [
  { id: 'search-1', query: 'Quantum Error Correction', resultsCount: 42, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'search-2', query: 'Solid-State Electrolytes', resultsCount: 38, createdAt: new Date(Date.now() - 3600000 * 48).toISOString() }
];

export async function initDatabase(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.log('ℹ️ [OpenScope DB] No DATABASE_URL provided. Running with high-fidelity in-memory persistence.');
    isPgAvailable = false;
    return;
  }

  try {
    pgPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3500,
      ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
        ? { rejectUnauthorized: false }
        : false
    });

    const client = await pgPool.connect();
    console.log('✅ [OpenScope DB] Successfully connected to PostgreSQL instance.');
    isPgAvailable = true;

    // Run schema bootstrap
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Lead Researcher',
        organization VARCHAR(255) DEFAULT 'Open Intelligence Lab',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS investigations (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        topic VARCHAR(255) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT DEFAULT '',
        saved_sources JSONB DEFAULT '[]'::jsonb,
        saved_findings JSONB DEFAULT '[]'::jsonb,
        timeline_items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS saved_searches (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        query_text VARCHAR(500) NOT NULL,
        filters JSONB DEFAULT '{}'::jsonb,
        results_count INT DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_memories (
        user_id VARCHAR(255) PRIMARY KEY,
        memory_data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        profile_data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial investigations need seeding
    const existing = await client.query('SELECT COUNT(*) FROM investigations');
    if (parseInt(existing.rows[0].count, 10) === 0) {
      for (const inv of INITIAL_INVESTIGATIONS) {
        await client.query(
          `INSERT INTO investigations (id, title, description, topic, tags, status, notes, saved_sources, saved_findings, timeline_items, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            inv.id,
            inv.title,
            inv.description,
            inv.topic,
            inv.tags,
            inv.status,
            inv.notes,
            JSON.stringify(inv.savedSources || []),
            JSON.stringify(inv.savedFindings || []),
            JSON.stringify(inv.timelineItems || []),
            inv.createdAt,
            inv.updatedAt
          ]
        );
      }
      console.log('🌱 [OpenScope DB] Seeded initial investigations into PostgreSQL.');
    }

    client.release();
  } catch (err: any) {
    console.warn(`⚠️ [OpenScope DB] Could not connect to PostgreSQL (${err.message}). Falling back gracefully to in-memory persistence.`);
    isPgAvailable = false;
  }
}

export function getDatabaseStatus(): { type: 'postgresql' | 'in-memory'; connected: boolean; details: string } {
  if (isPgAvailable && pgPool) {
    return {
      type: 'postgresql',
      connected: true,
      details: 'PostgreSQL 15+ cluster active with persistent relational tables'
    };
  }
  return {
    type: 'in-memory',
    connected: true,
    details: 'Resilient in-memory state engine active (fallback mode)'
  };
}

// Investigations Operations
export async function getInvestigations(): Promise<Investigation[]> {
  if (isPgAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM investigations ORDER BY updated_at DESC');
      return res.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        topic: row.topic,
        tags: row.tags || [],
        status: row.status,
        notes: row.notes || '',
        savedSources: Array.isArray(row.saved_sources) ? row.saved_sources : [],
        savedFindings: Array.isArray(row.saved_findings) ? row.saved_findings : [],
        timelineItems: Array.isArray(row.timeline_items) ? row.timeline_items : [],
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error fetching investigations from PG:', err);
    }
  }
  return fallbackStore;
}

export async function getInvestigation(id: string): Promise<Investigation | null> {
  if (isPgAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM investigations WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          title: row.title,
          description: row.description || '',
          topic: row.topic,
          tags: row.tags || [],
          status: row.status,
          notes: row.notes || '',
          savedSources: Array.isArray(row.saved_sources) ? row.saved_sources : [],
          savedFindings: Array.isArray(row.saved_findings) ? row.saved_findings : [],
          timelineItems: Array.isArray(row.timeline_items) ? row.timeline_items : [],
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching investigation from PG:', err);
    }
  }
  return fallbackStore.find(i => i.id === id) || null;
}

export async function createInvestigation(data: Partial<Investigation>): Promise<Investigation> {
  const newInv: Investigation = {
    id: data.id || `inv-${Date.now()}`,
    title: data.title || 'Untitled Investigation',
    description: data.description || '',
    topic: data.topic || data.title || 'General',
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: data.notes || `# ${data.title}\n\nWorkspace initial hypotheses and literature summary.`,
    savedSources: data.savedSources || [],
    savedFindings: data.savedFindings || [],
    timelineItems: data.timelineItems || []
  };

  if (isPgAvailable && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO investigations (id, title, description, topic, tags, status, notes, saved_sources, saved_findings, timeline_items, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newInv.id,
          newInv.title,
          newInv.description,
          newInv.topic,
          newInv.tags,
          newInv.status,
          newInv.notes,
          JSON.stringify(newInv.savedSources),
          JSON.stringify(newInv.savedFindings),
          JSON.stringify(newInv.timelineItems),
          newInv.createdAt,
          newInv.updatedAt
        ]
      );
    } catch (err) {
      console.error('Error creating investigation in PG:', err);
    }
  }

  fallbackStore.unshift(newInv);
  return newInv;
}

export async function updateInvestigation(id: string, data: Partial<Investigation>): Promise<Investigation | null> {
  const now = new Date().toISOString();

  if (isPgAvailable && pgPool) {
    try {
      const current = await getInvestigation(id);
      if (current) {
        const merged: Investigation = {
          ...current,
          ...data,
          id,
          updatedAt: now
        };

        await pgPool.query(
          `UPDATE investigations
           SET title = $1, description = $2, topic = $3, tags = $4, status = $5,
               notes = $6, saved_sources = $7, saved_findings = $8, timeline_items = $9, updated_at = $10
           WHERE id = $11`,
          [
            merged.title,
            merged.description,
            merged.topic,
            merged.tags,
            merged.status,
            merged.notes,
            JSON.stringify(merged.savedSources),
            JSON.stringify(merged.savedFindings),
            JSON.stringify(merged.timelineItems),
            now,
            id
          ]
        );
        return merged;
      }
    } catch (err) {
      console.error('Error updating investigation in PG:', err);
    }
  }

  const idx = fallbackStore.findIndex(i => i.id === id);
  if (idx !== -1) {
    fallbackStore[idx] = {
      ...fallbackStore[idx],
      ...data,
      id,
      updatedAt: now
    };
    return fallbackStore[idx];
  }
  return null;
}

export async function deleteInvestigation(id: string): Promise<boolean> {
  if (isPgAvailable && pgPool) {
    try {
      await pgPool.query('DELETE FROM investigations WHERE id = $1', [id]);
    } catch (err) {
      console.error('Error deleting investigation from PG:', err);
    }
  }

  const initialLen = fallbackStore.length;
  fallbackStore = fallbackStore.filter(i => i.id !== id);
  return fallbackStore.length < initialLen;
}

export async function addSourceToInvestigation(id: string, source: ResearchSource): Promise<Investigation | null> {
  const inv = await getInvestigation(id);
  if (!inv) return null;

  if (!inv.savedSources.some(s => s.id === source.id)) {
    inv.savedSources = [source, ...inv.savedSources];
    return await updateInvestigation(id, { savedSources: inv.savedSources });
  }
  return inv;
}

export async function addFindingToInvestigation(id: string, findingData: any): Promise<{ finding: Finding; investigation: Investigation } | null> {
  const inv = await getInvestigation(id);
  if (!inv) return null;

  const finding: Finding = {
    id: `fnd-${Date.now()}`,
    title: findingData.title || 'Untitled Finding',
    content: findingData.content || '',
    type: findingData.type || 'insight',
    sourceId: findingData.sourceId,
    sourceTitle: findingData.sourceTitle,
    createdAt: new Date().toISOString()
  };

  inv.savedFindings = [finding, ...inv.savedFindings];
  const updatedInv = await updateInvestigation(id, { savedFindings: inv.savedFindings });
  if (!updatedInv) return null;

  return { finding, investigation: updatedInv };
}

// Saved Searches
export async function saveSearchRecord(query: string, count: number, metadata?: any): Promise<void> {
  const record = {
    id: `search-${Date.now()}`,
    query,
    resultsCount: count,
    createdAt: new Date().toISOString(),
    metadata: metadata || {}
  };

  if (isPgAvailable && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO saved_searches (id, query_text, results_count, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [record.id, record.query, record.resultsCount, JSON.stringify(record.metadata), record.createdAt]
      );
    } catch (err) {
      console.error('Error saving search in PG:', err);
    }
  }

  savedSearchesStore.unshift(record);
  if (savedSearchesStore.length > 50) savedSearchesStore.pop();
}

export async function getSavedSearches(): Promise<any[]> {
  if (isPgAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM saved_searches ORDER BY created_at DESC LIMIT 20');
      return res.rows.map(r => ({
        id: r.id,
        query: r.query_text,
        resultsCount: r.results_count,
        createdAt: r.created_at,
        metadata: r.metadata
      }));
    } catch (err) {
      console.error('Error reading saved searches from PG:', err);
    }
  }
  return savedSearchesStore;
}
