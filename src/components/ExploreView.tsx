import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  BookOpen,
  Share2,
  BookmarkPlus,
  Clock,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  User,
  Lightbulb,
  Cpu,
  FileCheck,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { TopicResearchResult, ResearchSource, Entity } from '../types';

interface ExploreViewProps {
  searchResult: TopicResearchResult | null;
  isLoading: boolean;
  onSearch: (topic: string) => void;
  onSaveSource: (source: ResearchSource) => void;
  onNavigateToGraph: () => void;
  onNavigateToTimeline: () => void;
  onSaveFinding: (title: string, content: string, sourceTitle?: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  searchResult,
  isLoading,
  onSearch,
  onSaveSource,
  onNavigateToGraph,
  onNavigateToTimeline,
  onSaveFinding
}) => {
  const [searchInput, setSearchInput] = useState(searchResult?.query || '');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'OpenAlex' | 'arXiv' | 'Crossref' | 'Wikipedia'>('ALL');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [selectedEntityCategory, setSelectedEntityCategory] = useState<string>('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSources = (searchResult?.sources || []).filter(s => {
    if (sourceFilter === 'ALL') return true;
    return s.source.toLowerCase() === sourceFilter.toLowerCase();
  });

  const getSourceBadgeColor = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'arxiv':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'crossref':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'wikipedia':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-[#E6EDE4] text-[#42643A] border-[#D0DEC9]';
    }
  };

  const filteredEntities = (searchResult?.entities || []).filter(e => {
    if (selectedEntityCategory === 'ALL') return true;
    return e.type === selectedEntityCategory;
  });

  const entityTypeIcons: Record<string, any> = {
    PERSON: User,
    ORGANIZATION: Building,
    CONCEPT: Lightbulb,
    METHOD: Cpu,
    TOPIC: Layers,
    PAPER: BookOpen
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Search Header Bar */}
      <section className="bg-white rounded-2xl border border-[#E4E8DF] p-4 sm:p-6 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#849085] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search topic or concept (e.g. Solid-State Electrolytes, CRISPR, Quantum Error Correction)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] focus:bg-white rounded-xl text-sm text-[#1C241D] placeholder-[#849085] focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#42643A] hover:bg-[#354E2F] disabled:opacity-50 text-white text-xs font-medium px-6 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Querying Repositories...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Intelligence</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Quick Searches */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E4E8DF]/60 text-xs">
          <span className="text-[#849085]">Explore:</span>
          {['Quantum Error Correction', 'CRISPR Epigenome Editing', 'Solid-State Electrolytes', 'Mechanistic Interpretability'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setSearchInput(item);
                onSearch(item);
              }}
              className="text-[#586359] hover:text-[#283B2E] hover:underline transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
          {/* Status banner */}
          <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#E6EDE4] text-[#42643A] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-semibold text-[#1C241D]">Synthesizing Federated Intelligence</h3>
              <p className="text-xs text-[#586359]">
                Querying OpenAlex, arXiv, Crossref, and Wikipedia concurrently. Parsing full-text abstracts, generating TF-IDF keywords, and computing citation metrics...
              </p>
            </div>
          </div>

          {/* Skeleton Overview */}
          <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
            <div className="h-4 w-28 bg-[#EAEFE8] rounded-md" />
            <div className="h-8 w-2/3 bg-[#EAEFE8] rounded-lg" />
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full bg-[#F0F4EE] rounded" />
              <div className="h-3.5 w-11/12 bg-[#F0F4EE] rounded" />
              <div className="h-3.5 w-4/5 bg-[#F0F4EE] rounded" />
            </div>
          </div>

          {/* Skeleton Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-2">
                <div className="h-3 w-20 bg-[#EAEFE8] rounded" />
                <div className="h-6 w-16 bg-[#EAEFE8] rounded" />
                <div className="h-2.5 w-28 bg-[#F0F4EE] rounded" />
              </div>
            ))}
          </div>

          {/* Skeleton Sources List */}
          <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
            <div className="h-4 w-40 bg-[#EAEFE8] rounded-md" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-[#E4E8DF] bg-[#FDFEFC] space-y-2.5">
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-[#EAEFE8] rounded" />
                  <div className="h-4 w-24 bg-[#F0F4EE] rounded" />
                </div>
                <div className="h-5 w-3/4 bg-[#EAEFE8] rounded" />
                <div className="h-3 w-full bg-[#F0F4EE] rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !searchResult && (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-12 text-center shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#E6EDE4] text-[#42643A] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-[#1C241D]">Start Exploring Academic Literature</h3>
            <p className="text-xs text-[#586359] max-w-md mx-auto leading-relaxed">
              Enter any research field, scientific question, or technical paper query above. OpenScope will automatically cross-reference OpenAlex, arXiv, Crossref, and Wikipedia.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Quantum Computing', 'CRISPR Gene Editing', 'Solid-State Batteries', 'Transformer Architectures'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setSearchInput(t);
                  onSearch(t);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#354E2F] font-medium border border-[#D0DEC9] transition-colors cursor-pointer"
              >
                Explore "{t}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Results Display */}
      {!isLoading && searchResult && (
        <div className="space-y-6">
          {/* Topic Title & Overview Card */}
          <section className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#42643A] bg-[#E6EDE4] px-2 py-0.5 rounded-md">
                    Research Topic
                  </span>
                  <span className="text-xs text-[#849085]">
                    Query: "{searchResult.query}"
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C241D]">
                  {searchResult.title}
                </h1>
              </div>

              {/* Action Buttons to Graph and Timeline */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onNavigateToGraph}
                  className="flex items-center gap-1.5 bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium px-3.5 py-2 rounded-xl border border-[#D0DEC9] transition-colors shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#42643A]" />
                  <span>View Knowledge Graph</span>
                </button>
                <button
                  onClick={onNavigateToTimeline}
                  className="flex items-center gap-1.5 bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium px-3.5 py-2 rounded-xl border border-[#D0DEC9] transition-colors shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#42643A]" />
                  <span>Timeline</span>
                </button>
              </div>
            </div>

            {/* Overview paragraph */}
            <p className="text-sm sm:text-base text-[#3A453C] leading-relaxed font-normal bg-[#FDFEFC] p-4 rounded-xl border border-[#E4E8DF]">
              {searchResult.overview}
            </p>

            {/* Key Bullet Takeaways */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {searchResult.summaryBulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#586359] p-2.5 bg-[#F9FAF7] rounded-lg border border-[#E4E8DF]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#577F4D] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Metrics & Sentiment Analysis Banner */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
              <span className="text-xs text-[#849085]">Monitored Works</span>
              <div className="text-xl font-bold text-[#1C241D]">{searchResult.metrics.totalPapersFound} papers</div>
              <span className="text-[11px] text-[#586359]">Indexed via OpenAlex</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
              <span className="text-xs text-[#849085]">Average Citations</span>
              <div className="text-xl font-bold text-[#1C241D]">{searchResult.metrics.averageCitations} / work</div>
              <span className="text-[11px] text-[#586359]">High impact body of work</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
              <span className="text-xs text-[#849085]">Open Access Ratio</span>
              <div className="text-xl font-bold text-[#1C241D]">{searchResult.metrics.openAccessPercentage}%</div>
              <span className="text-[11px] text-[#586359]">Free unpaywalled access</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
              <span className="text-xs text-[#849085]">Literature Sentiment</span>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-[#1C241D] capitalize">
                  {searchResult.sentiment.label}
                </div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#E6EDE4] text-[#354E2F]">
                  {(searchResult.sentiment.score * 100).toFixed(0)}%
                </span>
              </div>
              <span className="text-[11px] text-[#586359] truncate block" title={searchResult.sentiment.tone}>
                {searchResult.sentiment.tone}
              </span>
            </div>
          </section>

          {/* Keywords & Related Topics Bar */}
          <section className="bg-white rounded-2xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#42643A]" />
                <h3 className="font-semibold text-sm text-[#1C241D]">Extracted Keywords & Salience</h3>
              </div>
              <span className="text-[11px] text-[#849085]">TF-IDF Weighted</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {searchResult.keywords.map((kw) => (
                <span
                  key={kw.word}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border border-[#E4E8DF] bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] transition-colors"
                >
                  <span className="font-medium">{kw.word}</span>
                  <span className="text-[10px] text-[#849085] font-mono">{(kw.weight * 10).toFixed(1)}</span>
                </span>
              ))}
            </div>

            {/* Related Topics */}
            {searchResult.relatedTopics.length > 0 && (
              <div className="pt-3 border-t border-[#E4E8DF] flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#849085]">Related topics to explore:</span>
                {searchResult.relatedTopics.map((rt) => (
                  <button
                    key={rt}
                    onClick={() => {
                      setSearchInput(rt);
                      onSearch(rt);
                    }}
                    className="text-[#42643A] hover:text-[#2C3E28] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {rt}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Entities Grid */}
          <section className="bg-white rounded-2xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#42643A]" />
                <h3 className="font-semibold text-sm text-[#1C241D]">Extracted Entities</h3>
                <span className="text-xs text-[#849085]">({filteredEntities.length})</span>
              </div>

              {/* Entity Category Filter */}
              <div className="flex flex-wrap items-center gap-1">
                {['ALL', 'PERSON', 'ORGANIZATION', 'CONCEPT', 'METHOD'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedEntityCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                      selectedEntityCategory === cat
                        ? 'bg-[#42643A] text-white font-medium'
                        : 'bg-[#F3F5F0] text-[#586359] hover:bg-[#E6EDE4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredEntities.map((ent) => {
                const IconComponent = entityTypeIcons[ent.type] || Lightbulb;
                return (
                  <div
                    key={ent.id}
                    className="p-3 rounded-xl border border-[#E4E8DF] hover:border-[#D0DEC9] bg-[#FDFEFC] space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E6EDE4] text-[#354E2F]">
                        <IconComponent className="w-3 h-3" />
                        {ent.type}
                      </span>
                      {ent.wikipediaUrl && (
                        <a
                          href={ent.wikipediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#849085] hover:text-[#354E2F] p-0.5"
                          title="View on Wikipedia"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="font-medium text-xs text-[#1C241D] truncate" title={ent.name}>
                      {ent.name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#849085]">
                      <span>Mentions: {ent.frequency}</span>
                      <span>Conf: {(ent.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Literature & Sources Section */}
          <section className="bg-white rounded-2xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#42643A]" />
                <h3 className="font-semibold text-sm text-[#1C241D]">Discovered Sources & Literature</h3>
                <span className="text-xs text-[#849085]">({filteredSources.length})</span>
              </div>

              {/* Source Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'OpenAlex', 'arXiv', 'Crossref', 'Wikipedia'] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => setSourceFilter(source)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      sourceFilter === source
                        ? 'bg-[#E6EDE4] text-[#1C241D] font-semibold border border-[#D0DEC9]'
                        : 'bg-[#F9FAF7] text-[#586359] border border-[#E4E8DF] hover:bg-[#F3F5F0]'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Sources */}
            <div className="space-y-3">
              {filteredSources.map((source) => {
                const isExpanded = !!expandedAbstracts[source.id];
                return (
                  <div
                    key={source.id}
                    className="p-4 rounded-xl border border-[#E4E8DF] hover:border-[#D0DEC9] bg-[#FDFEFC] space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getSourceBadgeColor(source.source)}`}>
                            {source.source}
                          </span>
                          {source.isOpenAccess && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6EDE4] text-[#42643A] font-semibold">
                              Open Access
                            </span>
                          )}
                          <span className="text-xs text-[#849085]">
                            {source.year} • {source.venue || 'Academic Repository'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-[#1C241D] leading-snug">
                          {source.title}
                        </h4>

                        <p className="text-xs text-[#586359]">
                          {source.authors.join(', ')}
                        </p>
                      </div>

                      {/* Right Citation & Save Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#1C241D]">{source.citations}</span>
                          <span className="text-[10px] text-[#849085] ml-1">citations</span>
                        </div>

                        <button
                          onClick={() => onSaveSource(source)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium border border-[#D0DEC9] transition-colors cursor-pointer"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-[#42643A]" />
                          <span>Pin to Project</span>
                        </button>
                      </div>
                    </div>

                    {/* Abstract text */}
                    <div className="text-xs text-[#586359] leading-relaxed bg-[#F9FAF7] p-3 rounded-lg border border-[#E4E8DF]/60">
                      <p className={isExpanded ? '' : 'line-clamp-2'}>
                        {source.abstract}
                      </p>
                      {source.abstract.length > 150 && (
                        <button
                          onClick={() => toggleAbstract(source.id)}
                          className="mt-1.5 text-xs text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Collapse abstract' : 'Read full abstract'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Footer Links & DOI */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E4E8DF]">
                      <div className="flex items-center gap-3 text-[#849085]">
                        {source.doi && (
                          <span className="font-mono text-[11px]">DOI: {source.doi}</span>
                        )}
                        <span className="text-[11px]">Relevance: {(source.relevanceScore * 100).toFixed(0)}%</span>
                      </div>

                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#42643A] hover:text-[#2C3E28] font-medium"
                        >
                          <span>External Source</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
