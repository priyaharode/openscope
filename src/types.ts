export type EntityType = 'PERSON' | 'ORGANIZATION' | 'CONCEPT' | 'PAPER' | 'TOPIC' | 'METHOD';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  frequency: number;
  confidence: number;
  wikipediaUrl?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  authors: string[];
  publishedDate: string;
  year: number;
  url: string;
  doi?: string;
  source: 'OpenAlex' | 'Wikipedia' | 'Web' | 'Custom' | 'arXiv' | 'Crossref' | 'PDF Upload';
  venue?: string;
  citations: number;
  abstract: string;
  type: 'journal' | 'preprint' | 'conference' | 'encyclopedia' | 'article';
  relevanceScore: number;
  sentimentScore: number;
  entities: string[];
  isOpenAccess?: boolean;
}

export interface TimelineEvent {
  id: string;
  year: number;
  date?: string;
  title: string;
  description: string;
  category: 'Breakthrough' | 'Publication' | 'Patent' | 'Methodology' | 'Debate';
  sourceTitle?: string;
  sourceUrl?: string;
  significance: 'high' | 'medium' | 'normal';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'topic' | 'person' | 'organization' | 'paper' | 'concept' | 'source';
  size?: number;
  color?: string;
  communityId?: number;
  clusterLabel?: string;
  degree?: number;
  importanceScore?: number;
  metadata?: {
    citations?: number;
    year?: number;
    category?: string;
    description?: string;
    url?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relationType?: 'cites' | 'authored' | 'affiliated' | 'develops' | 'mentions' | 'relates';
  weight: number;
}

export interface GraphCommunity {
  id: number;
  name: string;
  color: string;
  nodeCount: number;
  topEntities: string[];
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  density: number;
  avgDegree: number;
  communitiesCount: number;
  topCentralEntities: Array<{ id: string; label: string; type: string; score: number }>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities?: GraphCommunity[];
  stats?: GraphStats;
}

export interface TopicResearchResult {
  query: string;
  title: string;
  overview: string;
  summaryBulletPoints: string[];
  keywords: Array<{ word: string; weight: number }>;
  relatedTopics: string[];
  entities: Entity[];
  sources: ResearchSource[];
  timeline: TimelineEvent[];
  graph: GraphData;
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'neutral' | 'cautious' | 'contested';
    subjectivity: number; // 0 to 1
    tone: string;
  };
  metrics: {
    totalPapersFound: number;
    averageCitations: number;
    topYear: number;
    openAccessPercentage: number;
  };
}

export interface ExtractedSection {
  title: string;
  content: string;
  wordCount: number;
}

export interface SourceAnalysisResult {
  url: string;
  title: string;
  authors: string[];
  publishDate?: string;
  sourceType: string;
  domain: string;
  wordCount: number;
  readingTimeMinutes: number;
  readability: {
    fleschKincaidScore: number;
    gradeLevel: string;
    readingEase: 'Very Easy' | 'Standard' | 'Academic' | 'Highly Specialized';
  };
  sentiment: {
    score: number;
    label: 'Optimistic' | 'Balanced / Neutral' | 'Critical / Skeptical';
    polarity: number;
    subjectivity: number;
    toneDescription: string;
  };
  keywords: string[];
  executiveSummary: string;
  keyFindings: string[];
  entities: Entity[];
  citations: string[];
  extractedTextPreview: string;
  sections?: ExtractedSection[];
  references?: string[];
  pageCount?: number;
  pdfInfo?: {
    creator?: string;
    producer?: string;
    creationDate?: string;
  };
}

export interface PaperComparison {
  paperA: ResearchSource;
  paperB: ResearchSource;
  comparison: {
    researchQuestion: { a: string; b: string; synthesis: string };
    methodology: { a: string; b: string; synthesis: string };
    datasetSample: { a: string; b: string; synthesis: string };
    findings: { a: string; b: string; synthesis: string };
    limitations: { a: string; b: string; synthesis: string };
    metrics: {
      yearDiff: number;
      citationRatio: number;
      openAccessA: boolean;
      openAccessB: boolean;
    };
    areasOfAgreement: string[];
    areasOfDisagreement: string[];
    summaryTakeaway: string;
  };
}

export interface Finding {
  id: string;
  title: string;
  content: string;
  type: 'insight' | 'hypothesis' | 'fact' | 'question';
  sourceId?: string;
  sourceTitle?: string;
  createdAt: string;
}

export interface Investigation {
  id: string;
  userId?: string;
  title: string;
  description: string;
  topic: string;
  tags: string[];
  status: 'active' | 'in_review' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
  notes: string;
  savedSources: ResearchSource[];
  savedFindings: Finding[];
  timelineItems: TimelineEvent[];
}

export interface UserSettings {
  userName: string;
  userRole: string;
  organization: string;
  themeDensity: 'comfortable' | 'compact';
  openAlexEmail: string;
  defaultDataSource: 'all' | 'openalex' | 'wikipedia';
  autoExtractEntities: boolean;
  enableAiSummary: boolean;
  exportFormat: 'markdown' | 'bibtex' | 'json';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  organization: string;
  photoUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserSettings;
}

export interface UserMemoryRecentSearch {
  query: string;
  timestamp: string;
  resultsCount?: number;
}

export interface UserMemoryTopicFrequency {
  topic: string;
  count: number;
  lastSearched: string;
}

export interface UserMemoryViewedSource {
  id: string;
  title: string;
  source: string;
  year?: number;
  viewedAt: string;
  url?: string;
}

export interface UserMemory {
  uid: string;
  recentSearches: UserMemoryRecentSearch[];
  frequentlyResearchedTopics: UserMemoryTopicFrequency[];
  savedPaperCount: number;
  activeInvestigationCount: number;
  completedInvestigationCount: number;
  pinnedFindingCount: number;
  preferredResearchTopics: string[];
  recentlyViewedSources: UserMemoryViewedSource[];
  uiPreferences: {
    defaultDataSource?: string;
    graphLayout?: string;
    activeView?: string;
    themeDensity?: string;
  };
  updatedAt: string;
}
