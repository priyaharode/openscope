import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Bookmark,
  Trash2,
  Download,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Tag,
  Share2,
  ChevronRight,
  Edit3,
  Eye
} from 'lucide-react';
import { Investigation, Finding, ResearchSource } from '../types';
import { formatDate, exportInvestigationToMarkdown, downloadFile, generateBibTeX } from '../lib/utils';

interface WorkspaceViewProps {
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  onSelectInvestigation: (inv: Investigation) => void;
  onCreateInvestigation: () => void;
  onUpdateInvestigation: (updated: Investigation) => void;
  onDeleteInvestigation: (id: string) => void;
  onNavigateToExplore: (topic: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  investigations,
  activeInvestigation,
  onSelectInvestigation,
  onCreateInvestigation,
  onUpdateInvestigation,
  onDeleteInvestigation,
  onNavigateToExplore
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'sources' | 'findings' | 'timeline'>('notes');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState(activeInvestigation?.notes || '');

  // Finding modal
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingContent, setFindingContent] = useState('');
  const [findingType, setFindingType] = useState<Finding['type']>('insight');

  // Sync notes when active investigation changes
  React.useEffect(() => {
    if (activeInvestigation) {
      setNotesContent(activeInvestigation.notes || '');
      setIsEditingNotes(false);
    }
  }, [activeInvestigation?.id]);

  if (!activeInvestigation) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <FolderGit2 className="w-12 h-12 text-[#D0DEC9] mx-auto" />
        <h2 className="text-xl font-semibold text-[#1C241D]">No Investigation Selected</h2>
        <p className="text-xs text-[#586359] max-w-sm mx-auto">
          Create an investigation project or choose an existing one from the sidebar.
        </p>
        <button
          onClick={onCreateInvestigation}
          className="bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-4 py-2 rounded-xl"
        >
          Create Investigation
        </button>
      </div>
    );
  }

  const handleSaveNotes = () => {
    if (activeInvestigation) {
      const updated = {
        ...activeInvestigation,
        notes: notesContent,
        updatedAt: new Date().toISOString()
      };
      onUpdateInvestigation(updated);
      setIsEditingNotes(false);
    }
  };

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle.trim() || !findingContent.trim()) return;

    const newFinding: Finding = {
      id: `fnd-${Date.now()}`,
      title: findingTitle.trim(),
      content: findingContent.trim(),
      type: findingType,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...activeInvestigation,
      savedFindings: [newFinding, ...activeInvestigation.savedFindings],
      updatedAt: new Date().toISOString()
    };
    onUpdateInvestigation(updated);

    setFindingTitle('');
    setFindingContent('');
    setShowFindingModal(false);
  };

  const handleRemoveSource = (sourceId: string) => {
    const updated = {
      ...activeInvestigation,
      savedSources: activeInvestigation.savedSources.filter(s => s.id !== sourceId),
      updatedAt: new Date().toISOString()
    };
    onUpdateInvestigation(updated);
  };

  const handleRemoveFinding = (findingId: string) => {
    const updated = {
      ...activeInvestigation,
      savedFindings: activeInvestigation.savedFindings.filter(f => f.id !== findingId),
      updatedAt: new Date().toISOString()
    };
    onUpdateInvestigation(updated);
  };

  const handleExportMarkdown = () => {
    const md = exportInvestigationToMarkdown(activeInvestigation);
    downloadFile(md, `${activeInvestigation.title.replace(/\s+/g, '_')}_Report.md`, 'text/markdown');
  };

  const handleExportBibTeX = () => {
    const bib = activeInvestigation.savedSources.map(s => generateBibTeX(s)).join('\n\n');
    downloadFile(bib, `${activeInvestigation.title.replace(/\s+/g, '_')}_Citations.bib`, 'application/x-bibtex');
  };

  const handleExportJSON = () => {
    downloadFile(
      JSON.stringify(activeInvestigation, null, 2),
      `${activeInvestigation.title.replace(/\s+/g, '_')}_Archive.json`,
      'application/json'
    );
  };

  const findingTypeBadges: Record<Finding['type'], { label: string; icon: any; color: string }> = {
    insight: { label: 'Insight', icon: Sparkles, color: 'bg-[#E6EDE4] text-[#2C3E28] border-[#D0DEC9]' },
    hypothesis: { label: 'Hypothesis', icon: Lightbulb, color: 'bg-[#FAF3E3] text-[#8A6B29] border-[#EADBBE]' },
    fact: { label: 'Empirical Fact', icon: CheckCircle, color: 'bg-[#F4F7F3] text-[#42643A] border-[#D5DCD0]' },
    question: { label: 'Open Question', icon: HelpCircle, color: 'bg-[#F3F5F0] text-[#586359] border-[#E4E8DF]' }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Investigation Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E6EDE4] text-[#354E2F] font-semibold">
                {activeInvestigation.status}
              </span>
              <button
                onClick={() => onNavigateToExplore(activeInvestigation.topic)}
                className="text-xs text-[#42643A] hover:text-[#2C3E28] font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <span>Topic: {activeInvestigation.topic}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C241D]">
              {activeInvestigation.title}
            </h1>

            {activeInvestigation.description && (
              <p className="text-xs sm:text-sm text-[#586359] leading-relaxed">
                {activeInvestigation.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-[#849085] pt-1">
              <span>Created {formatDate(activeInvestigation.createdAt)}</span>
              <span>•</span>
              <span>Updated {formatDate(activeInvestigation.updatedAt)}</span>
            </div>
          </div>

          {/* Export and Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium rounded-xl border border-[#D0DEC9] transition-colors cursor-pointer"
              title="Download Markdown summary report"
            >
              <Download className="w-3.5 h-3.5 text-[#42643A]" />
              <span>Report (.md)</span>
            </button>

            <button
              onClick={handleExportBibTeX}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium rounded-xl border border-[#D0DEC9] transition-colors cursor-pointer"
              title="Download BibTeX citations"
            >
              <Download className="w-3.5 h-3.5 text-[#42643A]" />
              <span>BibTeX (.bib)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium rounded-xl border border-[#D0DEC9] transition-colors cursor-pointer"
              title="Export complete project JSON archive"
            >
              <Download className="w-3.5 h-3.5 text-[#42643A]" />
              <span>Archive (.json)</span>
            </button>

            <button
              onClick={() => onDeleteInvestigation(activeInvestigation.id)}
              className="p-2 text-[#849085] hover:text-[#963737] hover:bg-[#FBEAEA] rounded-xl transition-colors cursor-pointer"
              title="Delete investigation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-[#E4E8DF] pt-4 overflow-x-auto">
          {[
            { id: 'notes', label: 'Research Notes', icon: FileText, count: null },
            { id: 'sources', label: 'Pinned Literature', icon: BookOpen, count: activeInvestigation.savedSources.length },
            { id: 'findings', label: 'Discovered Findings', icon: Sparkles, count: activeInvestigation.savedFindings.length },
            { id: 'timeline', label: 'Timeline Milestones', icon: Clock, count: activeInvestigation.timelineItems.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#42643A] text-white shadow-xs'
                    : 'bg-[#F9FAF7] text-[#586359] border border-[#E4E8DF] hover:bg-[#E6EDE4]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#E6EDE4] text-[#354E2F]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Research Notes Editor */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1C241D] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#42643A]" />
              <span>Synthesized Research Notes</span>
            </h3>

            <div className="flex items-center gap-2">
              {isEditingNotes ? (
                <button
                  onClick={handleSaveNotes}
                  className="bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Save Notes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1.5 bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium px-3.5 py-1.5 rounded-xl border border-[#D0DEC9] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Markdown</span>
                </button>
              )}
            </div>
          </div>

          {isEditingNotes ? (
            <textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              rows={16}
              className="w-full p-4 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] focus:bg-white rounded-xl text-xs sm:text-sm font-mono text-[#1C241D] focus:outline-none leading-relaxed transition-all"
            />
          ) : (
            <div className="prose prose-sm max-w-none bg-[#FDFEFC] p-6 rounded-xl border border-[#E4E8DF] text-xs sm:text-sm text-[#3A453C] leading-relaxed whitespace-pre-wrap">
              {notesContent || 'No notes written yet. Click "Edit Markdown" to begin documenting findings.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pinned Sources */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#1C241D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#42643A]" />
                <span>Pinned Literature & Sources</span>
              </h3>
              <p className="text-xs text-[#586359]">
                Papers and external links saved during search sessions.
              </p>
            </div>
            <button
              onClick={() => onNavigateToExplore(activeInvestigation.topic)}
              className="text-xs text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center gap-1"
            >
              <span>Explore More Sources</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeInvestigation.savedSources.length === 0 ? (
            <div className="p-8 text-center text-[#849085] space-y-2 border border-dashed border-[#E4E8DF] rounded-xl">
              <BookOpen className="w-8 h-8 mx-auto text-[#D0DEC9]" />
              <p className="text-xs">No papers pinned yet. Use the "Explore" view to search and pin literature.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvestigation.savedSources.map((source) => (
                <div
                  key={source.id}
                  className="p-4 rounded-xl border border-[#E4E8DF] hover:border-[#D0DEC9] bg-[#FDFEFC] space-y-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F3F5F0] text-[#586359] border border-[#E4E8DF]">
                          {source.source}
                        </span>
                        <span className="text-xs text-[#849085]">{source.year} • {source.venue || 'Journal'}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#1C241D]">{source.title}</h4>
                      <p className="text-xs text-[#586359]">{source.authors.join(', ')}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      className="text-[#849085] hover:text-[#963737] p-1 rounded-lg"
                      title="Remove from investigation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#586359] line-clamp-2 leading-relaxed bg-[#F9FAF7] p-2.5 rounded-lg border border-[#E4E8DF]/60">
                    {source.abstract}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E4E8DF]">
                    <span className="text-[11px] text-[#849085]">{source.citations} citations</span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center gap-1"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Discovered Findings */}
      {activeTab === 'findings' && (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#1C241D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#42643A]" />
                <span>Logged Findings & Hypotheses</span>
              </h3>
              <p className="text-xs text-[#586359]">
                Structured deductions, open questions, and empirical insights.
              </p>
            </div>
            <button
              onClick={() => setShowFindingModal(true)}
              className="flex items-center gap-1.5 bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Finding</span>
            </button>
          </div>

          {activeInvestigation.savedFindings.length === 0 ? (
            <div className="p-8 text-center text-[#849085] space-y-2 border border-dashed border-[#E4E8DF] rounded-xl">
              <Sparkles className="w-8 h-8 mx-auto text-[#D0DEC9]" />
              <p className="text-xs">No findings recorded yet. Click "Add Finding" to log a hypothesis or key insight.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeInvestigation.savedFindings.map((finding) => {
                const badge = findingTypeBadges[finding.type] || findingTypeBadges.insight;
                const IconComponent = badge.icon;
                return (
                  <div
                    key={finding.id}
                    className="p-4 rounded-xl border border-[#E4E8DF] bg-[#FDFEFC] space-y-2.5 transition-colors relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                        <IconComponent className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <button
                        onClick={() => handleRemoveFinding(finding.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#849085] hover:text-[#963737] p-1 rounded transition-opacity"
                        title="Delete finding"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-[#1C241D] leading-snug">
                      {finding.title}
                    </h4>

                    <p className="text-xs text-[#586359] leading-relaxed">
                      {finding.content}
                    </p>

                    {finding.sourceTitle && (
                      <div className="text-[11px] text-[#849085] truncate pt-1 border-t border-[#E4E8DF]">
                        Ref: {finding.sourceTitle}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Timeline Milestones */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-[#1C241D] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#42643A]" />
            <span>Associated Timeline Milestones</span>
          </h3>

          {activeInvestigation.timelineItems.length === 0 ? (
            <div className="p-8 text-center text-[#849085] space-y-2 border border-dashed border-[#E4E8DF] rounded-xl">
              <Clock className="w-8 h-8 mx-auto text-[#D0DEC9]" />
              <p className="text-xs">No timeline events pinned. Timeline milestones discovered during search will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvestigation.timelineItems.map((evt, i) => (
                <div key={i} className="p-3 bg-[#F9FAF7] rounded-xl border border-[#E4E8DF] flex items-start gap-3">
                  <span className="font-mono font-bold text-xs text-[#1C241D] bg-white px-2 py-1 rounded border border-[#E4E8DF]">
                    {evt.year}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold text-[#1C241D]">{evt.title}</h5>
                    <p className="text-xs text-[#586359]">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Finding Modal */}
      {showFindingModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 max-w-lg w-full shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-[#1C241D]">Record New Research Finding</h3>

            <form onSubmit={handleCreateFinding} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#586359]">Finding Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['insight', 'hypothesis', 'fact', 'question'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFindingType(t)}
                      className={`text-xs capitalize py-1.5 rounded-lg border transition-colors ${
                        findingType === t
                          ? 'bg-[#42643A] text-white font-medium border-[#354E2F]'
                          : 'bg-[#F9FAF7] text-[#586359] border-[#E4E8DF] hover:bg-[#E6EDE4]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#586359]">Headline / Claim</label>
                <input
                  type="text"
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  placeholder="e.g. Critical current density thresholds observed in lithium-garnet interface"
                  className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs text-[#1C241D] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#586359]">Detailed Evidence / Notes</label>
                <textarea
                  value={findingContent}
                  onChange={(e) => setFindingContent(e.target.value)}
                  placeholder="Elaborate on the scientific deduction, experimental parameters, or literature backing..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs text-[#1C241D] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8DF]">
                <button
                  type="button"
                  onClick={() => setShowFindingModal(false)}
                  className="text-xs text-[#586359] hover:bg-[#F3F5F0] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
