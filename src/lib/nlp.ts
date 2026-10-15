import { Entity, GraphData, GraphNode, GraphEdge } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'isn\'t', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor',
  'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'also', 'using', 'based',
  'study', 'paper', 'results', 'data', 'approach', 'system', 'research', 'analysis', 'show', 'used', 'method'
]);

const POSITIVE_WORDS = new Set([
  'breakthrough', 'efficient', 'promising', 'novel', 'superior', 'significant', 'robust', 'advantage',
  'effective', 'improve', 'improved', 'improvement', 'success', 'successful', 'optimized', 'accurate',
  'innovative', 'potential', 'scalable', 'sustainable', 'benefit', 'reliable', 'validated', 'outperform',
  'progress', 'solution', 'transformative', 'favorable', 'exceptional', 'pioneering', 'comprehensive'
]);

const NEGATIVE_WORDS = new Set([
  'limitation', 'limited', 'drawback', 'bottleneck', 'failure', 'risk', 'flaw', 'challenge', 'difficult',
  'inefficient', 'vulnerable', 'vulnerability', 'error', 'uncertainty', 'decline', 'degrade', 'hazard',
  'conflict', 'unreliable', 'prohibitive', 'costly', 'disadvantage', 'degradation', 'bias', 'controversial'
]);

// Syllable counter for Flesch-Kincaid
export function countSyllables(word: string): number {
  word = word.toLowerCase().trim().replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function calculateReadability(text: string): {
  fleschKincaidScore: number;
  gradeLevel: string;
  readingEase: 'Very Easy' | 'Standard' | 'Academic' | 'Highly Specialized';
} {
  if (!text || text.trim().length === 0) {
    return { fleschKincaidScore: 50, gradeLevel: '10th Grade', readingEase: 'Standard' };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];

  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  // Flesch Reading Ease formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / wordCount;
  let score = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  score = Math.max(0, Math.min(100, Math.round(score)));

  let gradeLevel = 'Undergraduate';
  let readingEase: 'Very Easy' | 'Standard' | 'Academic' | 'Highly Specialized' = 'Standard';

  if (score >= 80) {
    readingEase = 'Very Easy';
    gradeLevel = '6th - 8th Grade';
  } else if (score >= 60) {
    readingEase = 'Standard';
    gradeLevel = '9th - 12th Grade';
  } else if (score >= 35) {
    readingEase = 'Academic';
    gradeLevel = 'College / University';
  } else {
    readingEase = 'Highly Specialized';
    gradeLevel = 'Post-Graduate / Peer-Reviewed';
  }

  return { fleschKincaidScore: score, gradeLevel, readingEase };
}

export function extractKeywords(text: string, maxKeywords = 12): Array<{ word: string; weight: number }> {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const frequencyMap = new Map<string, number>();

  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      frequencyMap.set(w, (frequencyMap.get(w) || 0) + 1);
    }
  }

  const sorted = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords);

  const maxFreq = sorted[0]?.[1] || 1;
  return sorted.map(([word, count]) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    weight: Math.round((count / maxFreq) * 100) / 100
  }));
}

export function analyzeSentiment(text: string): {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'cautious' | 'contested';
  subjectivity: number;
  tone: string;
} {
  if (!text) return { score: 0, label: 'neutral', subjectivity: 0.2, tone: 'Neutral Academic' };
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  let posCount = 0;
  let negCount = 0;

  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) posCount++;
    if (NEGATIVE_WORDS.has(w)) negCount++;
  }

  const totalEvaluated = posCount + negCount;
  const score = totalEvaluated > 0 
    ? Math.round(((posCount - negCount) / Math.max(1, totalEvaluated)) * 100) / 100 
    : 0.05;

  const subjectivity = Math.min(1, Math.round((totalEvaluated / Math.max(20, words.length * 0.15)) * 100) / 100);

  let label: 'positive' | 'neutral' | 'cautious' | 'contested' = 'neutral';
  let tone = 'Objective Empirical';

  if (score > 0.3) {
    label = 'positive';
    tone = 'Optimistic / High Potential';
  } else if (score < -0.2) {
    label = 'cautious';
    tone = 'Critical / Risk Aware';
  } else if (posCount > 2 && negCount > 2) {
    label = 'contested';
    tone = 'Contested / Active Debate';
  }

  return { score, label, subjectivity, tone };
}

export function extractEntitiesFromText(text: string, titleHint?: string): Entity[] {
  const entities: Entity[] = [];
  const foundNames = new Set<string>();

  // Extract Capitalized sequences (2-4 words) - e.g. "Google DeepMind", "Max Planck Institute"
  const properNounRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;
  let match;
  while ((match = properNounRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    if (raw.length > 3 && !foundNames.has(raw.toLowerCase())) {
      const lower = raw.toLowerCase();
      // Classify
      let type: Entity['type'] = 'CONCEPT';
      if (lower.includes('university') || lower.includes('institute') || lower.includes('lab') || lower.includes('google') || lower.includes('microsoft') || lower.includes('openai') || lower.includes('deepmind') || lower.includes('corp') || lower.includes('cern') || lower.includes('nasa') || lower.includes('foundation')) {
        type = 'ORGANIZATION';
      } else if (raw.split(' ').length === 2 && !raw.includes('Theorem') && !raw.includes('Theory') && !raw.includes('Algorithm')) {
        // High likelihood person name if 2 capitalized words
        type = 'PERSON';
      } else if (lower.includes('algorithm') || lower.includes('method') || lower.includes('model') || lower.includes('architecture') || lower.includes('network')) {
        type = 'METHOD';
      }

      foundNames.add(lower);
      entities.push({
        id: `entity-${entities.length + 1}`,
        name: raw,
        type,
        frequency: (text.match(new RegExp(raw, 'gi')) || []).length,
        confidence: 0.85,
        wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(raw)}`
      });
    }
  }

  // Include title hint as TOPIC if present
  if (titleHint && !foundNames.has(titleHint.toLowerCase())) {
    entities.unshift({
      id: 'entity-core-topic',
      name: titleHint,
      type: 'TOPIC',
      frequency: 10,
      confidence: 0.99,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(titleHint)}`
    });
  }

  return entities.slice(0, 16);
}

export function buildKnowledgeGraph(
  topic: string,
  entities: Entity[],
  sources: Array<{ title: string; authors: string[]; year: number }>
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Set<string>();

  // Central Topic node
  const rootId = 'node-root-topic';
  nodes.push({
    id: rootId,
    label: topic,
    type: 'topic',
    size: 44,
    color: '#42643A',
    metadata: { description: `Focal research topic: ${topic}` }
  });
  nodeMap.add(rootId);

  // Add top entities
  entities.slice(0, 14).forEach((e, idx) => {
    const eId = `node-entity-${idx}`;
    if (!nodeMap.has(eId)) {
      nodeMap.add(eId);
      nodes.push({
        id: eId,
        label: e.name,
        type: e.type.toLowerCase() as any,
        size: e.type === 'ORGANIZATION' ? 28 : e.type === 'PERSON' ? 26 : 22,
        metadata: {
          category: e.type,
          description: `Extracted ${e.type.toLowerCase()}`,
          url: e.wikipediaUrl
        }
      });

      // Link to root
      const rel = e.type === 'PERSON' ? 'authored' : e.type === 'ORGANIZATION' ? 'affiliated' : 'relates';
      edges.push({
        id: `edge-root-${eId}`,
        source: rootId,
        target: eId,
        label: e.type === 'PERSON' ? 'researched by' : e.type === 'ORGANIZATION' ? 'affiliated with' : 'relates to',
        relationType: rel as any,
        weight: Math.min(5, Math.max(1, e.frequency))
      });
    }
  });

  // Add representative papers/sources
  sources.slice(0, 8).forEach((s, idx) => {
    const sId = `node-source-${idx}`;
    if (!nodeMap.has(sId)) {
      nodeMap.add(sId);
      nodes.push({
        id: sId,
        label: s.title.length > 38 ? s.title.substring(0, 35) + '...' : s.title,
        type: 'paper',
        size: 20,
        metadata: {
          year: s.year,
          description: s.title
        }
      });

      // Link to root
      edges.push({
        id: `edge-source-${sId}`,
        source: rootId,
        target: sId,
        label: `published (${s.year})`,
        relationType: 'cites',
        weight: 2
      });

      // Cross-link with any authors if matched
      if (s.authors && s.authors.length > 0) {
        const firstAuthor = s.authors[0];
        const matchedEntity = nodes.find(n => n.type === 'person' && n.label.toLowerCase().includes(firstAuthor.toLowerCase().split(' ').pop() || ''));
        if (matchedEntity) {
          edges.push({
            id: `edge-auth-${sId}-${matchedEntity.id}`,
            source: matchedEntity.id,
            target: sId,
            label: 'authored',
            relationType: 'authored',
            weight: 3
          });
        }
      }
    }
  });

  // Cross-link entities of same type or high co-occurrence
  for (let i = 1; i < Math.min(nodes.length, 8); i++) {
    for (let j = i + 1; j < Math.min(nodes.length, 9); j++) {
      if (nodes[i].type !== nodes[j].type && Math.random() > 0.45) {
        edges.push({
          id: `edge-cross-${nodes[i].id}-${nodes[j].id}`,
          source: nodes[i].id,
          target: nodes[j].id,
          label: 'associated with',
          relationType: 'develops',
          weight: 1
        });
      }
    }
  }

  // Calculate Node Degree
  const degreeMap = new Map<string, number>();
  nodes.forEach(n => degreeMap.set(n.id, 0));
  edges.forEach(e => {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
  });

  // Calculate PageRank (20 iterations, damping 0.85)
  const N = nodes.length;
  let ranks = new Map<string, number>();
  nodes.forEach(n => ranks.set(n.id, 1 / N));
  const damping = 0.85;

  for (let iter = 0; iter < 15; iter++) {
    const nextRanks = new Map<string, number>();
    nodes.forEach(n => nextRanks.set(n.id, (1 - damping) / N));

    edges.forEach(e => {
      const sourceRank = ranks.get(e.source) || 0;
      const outDeg = degreeMap.get(e.source) || 1;
      const share = (sourceRank / outDeg) * damping;
      nextRanks.set(e.target, (nextRanks.get(e.target) || 0) + share);

      const targetRank = ranks.get(e.target) || 0;
      const inDeg = degreeMap.get(e.target) || 1;
      const backShare = (targetRank / inDeg) * damping;
      nextRanks.set(e.source, (nextRanks.get(e.source) || 0) + backShare);
    });

    ranks = nextRanks;
  }

  // Community Detection via Label Propagation
  const communityColors = ['#42643A', '#2E6171', '#8C5A32', '#694D75', '#5F7335', '#A35338'];
  const communityThemes = [
    'Foundational Theory & Models',
    'Architectures & Hardware',
    'Empirical Benchmarks & Datasets',
    'Algorithms & Optimization Protocols',
    'Institutional Consortiums',
    'Emerging Preprints'
  ];

  // Initialize community per node
  const nodeCommunity = new Map<string, number>();
  nodes.forEach((n, idx) => {
    if (n.id === rootId) {
      nodeCommunity.set(n.id, 0);
    } else if (n.type === 'organization') {
      nodeCommunity.set(n.id, 4 % communityColors.length);
    } else if (n.type === 'paper') {
      nodeCommunity.set(n.id, 2 % communityColors.length);
    } else if (n.type === 'person') {
      nodeCommunity.set(n.id, 1 % communityColors.length);
    } else {
      nodeCommunity.set(n.id, (idx % 4));
    }
  });

  // Run 3 label-propagation steps
  for (let step = 0; step < 3; step++) {
    nodes.forEach(n => {
      if (n.id === rootId) return;
      const neighborCommCounts = new Map<number, number>();
      edges.forEach(e => {
        let neighborId: string | null = null;
        if (e.source === n.id) neighborId = e.target;
        else if (e.target === n.id) neighborId = e.source;

        if (neighborId) {
          const c = nodeCommunity.get(neighborId);
          if (c !== undefined) {
            neighborCommCounts.set(c, (neighborCommCounts.get(c) || 0) + e.weight);
          }
        }
      });

      let bestComm = nodeCommunity.get(n.id) || 0;
      let maxCount = -1;
      neighborCommCounts.forEach((cnt, c) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          bestComm = c;
        }
      });
      nodeCommunity.set(n.id, bestComm);
    });
  }

  // Assign computed scores and community back to nodes
  const maxRank = Math.max(...Array.from(ranks.values()), 0.001);
  nodes.forEach(n => {
    const deg = degreeMap.get(n.id) || 1;
    const pr = ranks.get(n.id) || 0.01;
    const importance = Math.round((pr / maxRank) * 100) / 100;
    const commId = nodeCommunity.get(n.id) || 0;

    n.degree = deg;
    n.importanceScore = importance;
    n.communityId = commId;
    n.clusterLabel = communityThemes[commId % communityThemes.length];
    if (n.id !== rootId) {
      n.color = communityColors[commId % communityColors.length];
      n.size = Math.min(38, Math.max(16, Math.round(18 + importance * 18)));
    }
  });

  // Aggregate community stats
  const communityCounts = new Map<number, number>();
  const communityEntities = new Map<number, string[]>();
  nodes.forEach(n => {
    const cid = n.communityId || 0;
    communityCounts.set(cid, (communityCounts.get(cid) || 0) + 1);
    if (!communityEntities.has(cid)) communityEntities.set(cid, []);
    communityEntities.get(cid)!.push(n.label);
  });

  const communities = Array.from(communityCounts.entries()).map(([cid, count]) => ({
    id: cid,
    name: communityThemes[cid % communityThemes.length],
    color: communityColors[cid % communityColors.length],
    nodeCount: count,
    topEntities: (communityEntities.get(cid) || []).slice(0, 4)
  }));

  // Graph summary statistics
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const maxPossibleEdges = (totalNodes * (totalNodes - 1)) / 2;
  const density = maxPossibleEdges > 0 ? Math.round((totalEdges / maxPossibleEdges) * 1000) / 1000 : 0;
  const avgDegree = totalNodes > 0 ? Math.round(((totalEdges * 2) / totalNodes) * 10) / 10 : 0;

  const topCentralEntities = [...nodes]
    .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
    .slice(0, 5)
    .map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      score: n.importanceScore || 0
    }));

  return {
    nodes,
    edges,
    communities,
    stats: {
      totalNodes,
      totalEdges,
      density,
      avgDegree,
      communitiesCount: communities.length,
      topCentralEntities
    }
  };
}

