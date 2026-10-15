import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  FolderGit2,
  FileText,
  Share2,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Award,
  Layers,
  ExternalLink,
  ChevronRight,
  Database,
  GitCompare,
  UploadCloud,
  Compass
} from 'lucide-react';
import { Investigation, ResearchSource } from '../types';
import { TRENDING_TOPICS } from '../lib/researchData';
import { formatDate } from '../lib/utils';
import { ResearchCharts } from './ResearchCharts';

interface DashboardViewProps {
  onSearchTopic: (topic: string) => void;
  investigations: Investigation[];
  onSelectInvestigation: (inv: Investigation) => void;
  onCreateInvestigation: () => void;
  onNavigate: (view: string) => void;
  recentSources: ResearchSource[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSearchTopic,
  investigations,
  onSelectInvestigation,
  onCreateInvestigation,
  onNavigate,
  recentSources
}) => {
  const [queryInput, setQueryInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onSearchTopic(queryInput.trim());
      onNavigate('explore');
    }
  };

  const sampleChips = [
    'Quantum Error Correction',
    'CRISPR Epigenome Editing',
    'Solid-State Electrolytes',
    'Mechanistic Interpretability',
    'Neuromorphic Synaptic Devices'
  ];

  const getSourceBadgeColor = (src: string) => {
    switch (src) {
      case 'arXiv':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Crossref':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Wikipedia':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'PDF Manuscript':
      case 'PDF Upload':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-[#E6EDE4] text-[#42643A] border-[#D0DEC9]';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Hero Quick Search Section */}
      <section className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EDE4] border border-[#D0DEC9] text-[#1C241D] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#42643A]" />
            <span>Open-Source Research Intelligence Dashboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C241D] leading-tight">
            Synthesize scholarly literature, entities, and knowledge graphs in real time.
          </h1>

          <p className="text-xs sm:text-sm text-[#586359] leading-relaxed">
            Query across federated open repositories: <strong>OpenAlex</strong>, <strong>arXiv</strong>, <strong>Crossref</strong>, and <strong>Wikipedia</strong>.
            Analyze PDF manuscripts, detect graph clusters, compare papers side-by-side, and track investigations with persistent storage.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center shadow-xs rounded-xl overflow-hidden border border-[#D5DCD0] bg-white focus-within:border-[#42643A] transition-all">
              <Search className="w-5 h-5 text-[#849085] ml-4 shrink-0" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search any scientific concept, DOI, paper title, or author..."
                className="w-full py-3.5 px-3 text-xs sm:text-sm text-[#1C241D] placeholder-[#849085] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#42643A] hover:bg-[#35522e] text-white px-5 py-3.5 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Investigate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[#849085]">Suggested topics:</span>
            {sampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  onSearchTopic(chip);
                  onNavigate('explore');
                }}
                className="text-xs bg-white hover:bg-[#E6EDE4] hover:text-[#1C241D] text-[#586359] px-2.5 py-1 rounded-lg border border-[#E4E8DF] transition-colors shadow-2xs cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Primary Action Feature Hub */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Compare Papers Card */}
        <div
          onClick={() => onNavigate('compare')}
          className="bg-[#FBFBF9] border border-[#E4E8DF] hover:border-[#42643A]/40 rounded-xl p-4 shadow-xs transition-all cursor-pointer group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E6EDE4] group-hover:bg-[#42643A] text-[#42643A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1C241D] group-hover:text-[#42643A] transition-colors flex items-center gap-1">
              Compare Papers <ChevronRight className="w-3.5 h-3.5" />
            </h3>
            <p className="text-[11px] text-[#586359] mt-0.5 leading-relaxed">
              Side-by-side synthesis of methodologies, datasets, benchmarks, and divergence.
            </p>
          </div>
        </div>

        {/* PDF Manuscript Analyzer Card */}
        <div
          onClick={() => onNavigate('analyzer')}
          className="bg-[#FBFBF9] border border-[#E4E8DF] hover:border-[#42643A]/40 rounded-xl p-4 shadow-xs transition-all cursor-pointer group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E6EDE4] group-hover:bg-[#42643A] text-[#42643A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1C241D] group-hover:text-[#42643A] transition-colors flex items-center gap-1">
              PDF Manuscript Analyzer <ChevronRight className="w-3.5 h-3.5" />
            </h3>
            <p className="text-[11px] text-[#586359] mt-0.5 leading-relaxed">
              Drag-and-drop PDF extraction of sections, references, reading ease, and findings.
            </p>
          </div>
        </div>

        {/* Knowledge Graph Card */}
        <div
          onClick={() => onNavigate('graph')}
          className="bg-[#FBFBF9] border border-[#E4E8DF] hover:border-[#42643A]/40 rounded-xl p-4 shadow-xs transition-all cursor-pointer group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E6EDE4] group-hover:bg-[#42643A] text-[#42643A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1C241D] group-hover:text-[#42643A] transition-colors flex items-center gap-1">
              Knowledge Graph & Clusters <ChevronRight className="w-3.5 h-3.5" />
            </h3>
            <p className="text-[11px] text-[#586359] mt-0.5 leading-relaxed">
              Community detection, PageRank centrality scoring, and relationship filtering.
            </p>
          </div>
        </div>
      </section>

      {/* Research Statistics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FBFBF9] p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#849085]">
            <span className="text-xs font-medium">OpenAlex + arXiv + Crossref</span>
            <BookOpen className="w-4 h-4 text-[#42643A]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#1C241D]">280M+</div>
          <p className="text-[11px] text-[#586359]">Peer-reviewed works and preprints</p>
        </div>

        <div className="bg-[#FBFBF9] p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#849085]">
            <span className="text-xs font-medium">Graph Communities</span>
            <Compass className="w-4 h-4 text-[#42643A]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#1C241D]">6 Clusters</div>
          <p className="text-[11px] text-[#586359]">Automated modularity detection</p>
        </div>

        <div className="bg-[#FBFBF9] p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#849085]">
            <span className="text-xs font-medium">Open Access Ratio</span>
            <Award className="w-4 h-4 text-[#42643A]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#1C241D]">86.4%</div>
          <p className="text-[11px] text-[#586359]">Unpaywalled scientific content</p>
        </div>

        <div className="bg-[#FBFBF9] p-4 rounded-xl border border-[#E4E8DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#849085]">
            <span className="text-xs font-medium">Investigation Workspaces</span>
            <FolderGit2 className="w-4 h-4 text-[#42643A]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#1C241D]">{investigations.length}</div>
          <p className="text-[11px] text-[#586359]">Persistent active workspaces</p>
        </div>
      </section>

      {/* ECharts Analytics Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#42643A]"></span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C241D]">
            Research Velocity & Discipline Analytics
          </h2>
        </div>
        <ResearchCharts />
      </section>

      {/* Main Grid: Recent Investigations & Trending Research Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Investigations & Recently Analyzed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Investigations Card */}
          <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#42643A]" />
                <h2 className="font-bold text-sm text-[#1C241D]">Active Investigations</h2>
              </div>
              <button
                onClick={() => onNavigate('workspace')}
                className="text-xs font-semibold text-[#42643A] hover:text-[#35522e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All Workspaces</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {investigations.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => {
                    onSelectInvestigation(inv);
                    onNavigate('workspace');
                  }}
                  className="p-4 rounded-xl border border-[#E4E8DF] hover:border-[#42643A]/40 bg-white hover:bg-[#FAF3E3]/20 transition-all cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#1C241D] group-hover:text-[#42643A] transition-colors line-clamp-1">
                      {inv.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E6EDE4] text-[#42643A] font-semibold shrink-0">
                      {inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#586359] line-clamp-2 leading-relaxed">
                    {inv.description || inv.notes.substring(0, 100)}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#849085] pt-1 border-t border-[#E4E8DF]">
                    <span>{inv.savedSources.length} sources pinned</span>
                    <span>{formatDate(inv.updatedAt)}</span>
                  </div>
                </div>
              ))}

              {/* Create new card */}
              <button
                onClick={onCreateInvestigation}
                className="p-4 rounded-xl border border-dashed border-[#D5DCD0] hover:border-[#42643A] bg-white hover:bg-[#E6EDE4]/30 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group min-h-[120px]"
              >
                <div className="w-8 h-8 rounded-full bg-[#E6EDE4] group-hover:bg-[#42643A] text-[#42643A] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                </div>
                <span className="text-xs font-semibold text-[#1C241D]">Create New Investigation</span>
                <span className="text-[11px] text-[#849085]">Organize papers, graph, and notes</span>
              </button>
            </div>
          </div>

          {/* Recently Analyzed Sources */}
          <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#42643A]" />
                <h2 className="font-bold text-sm text-[#1C241D]">Recently Analyzed Sources</h2>
              </div>
              <button
                onClick={() => onNavigate('analyzer')}
                className="text-xs font-semibold text-[#42643A] hover:text-[#35522e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Analyze New Source</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentSources.slice(0, 4).map((src) => (
                <div
                  key={src.id}
                  className="p-3 rounded-xl border border-[#E4E8DF] hover:border-[#42643A]/30 bg-white flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${getSourceBadgeColor(src.source)}`}>
                        {src.source}
                      </span>
                      <h4 className="text-xs font-semibold text-[#1C241D] truncate">
                        {src.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#849085] truncate">
                      {src.authors.join(', ')} • {src.venue || 'Journal'} ({src.year})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#1C241D]">{src.citations}</span>
                      <span className="text-[10px] text-[#849085] block">citations</span>
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#849085] hover:text-[#42643A] rounded-lg hover:bg-[#E6EDE4] transition-colors"
                        title="Open external source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Trending Research Topics & Activity */}
        <div className="space-y-6">
          <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#42643A]" />
                <h2 className="font-bold text-sm text-[#1C241D]">Trending Topics</h2>
              </div>
              <span className="text-[11px] font-mono text-[#849085]">Velocity Index</span>
            </div>

            <div className="space-y-3">
              {TRENDING_TOPICS.map((item) => (
                <div
                  key={item.topic}
                  onClick={() => {
                    onSearchTopic(item.topic);
                    onNavigate('explore');
                  }}
                  className="p-3 rounded-xl border border-[#E4E8DF] hover:border-[#42643A]/40 bg-white hover:bg-[#FAF3E3]/20 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C241D] group-hover:text-[#42643A] transition-colors">
                      {item.topic}
                    </span>
                    <span className="text-[10px] font-semibold text-[#42643A] bg-[#E6EDE4] px-1.5 py-0.5 rounded">
                      {item.velocity}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#586359] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#849085] pt-1">
                    <span>{item.category}</span>
                    <span className="font-mono">{item.papersCount} papers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Repositories Card */}
          <div className="bg-[#E6EDE4]/60 border border-[#42643A]/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C241D]">
              <Database className="w-3.5 h-3.5 text-[#42643A]" />
              <span>Federated Scientific Connectors</span>
            </div>
            <p className="text-xs text-[#3A453C] leading-relaxed">
              OpenScope concurrently queries OpenAlex (250M+ citation graph), arXiv preprints, Crossref DOI registry, and Wikipedia academic summaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
