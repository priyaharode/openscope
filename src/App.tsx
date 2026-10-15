import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ExploreView } from './components/ExploreView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { TimelineView } from './components/TimelineView';
import { SourceAnalyzerView } from './components/SourceAnalyzerView';
import { WorkspaceView } from './components/WorkspaceView';
import { SettingsView } from './components/SettingsView';
import { PaperComparisonView } from './components/PaperComparisonView';
import { SaveSourceModal } from './components/SaveSourceModal';
import { NewInvestigationModal } from './components/NewInvestigationModal';
import { ToastContainer, toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

import {
  TopicResearchResult,
  Investigation,
  ResearchSource,
  SourceAnalysisResult,
  UserSettings
} from './types';
import {
  SAMPLE_RESEARCH_RESULTS,
  INITIAL_INVESTIGATIONS,
  DEFAULT_USER_SETTINGS
} from './lib/researchData';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [investigations, setInvestigations] = useState<Investigation[]>(INITIAL_INVESTIGATIONS);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(INITIAL_INVESTIGATIONS[0]);
  const [searchResult, setSearchResult] = useState<TopicResearchResult | null>(
    SAMPLE_RESEARCH_RESULTS['Quantum Error Correction']
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Modals state
  const [sourceToSave, setSourceToSave] = useState<ResearchSource | null>(null);
  const [isNewInvModalOpen, setIsNewInvModalOpen] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch investigations from API on mount
  useEffect(() => {
    fetch('/api/investigations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.investigations && Array.isArray(data.investigations) && data.investigations.length > 0) {
          setInvestigations(data.investigations);
          setActiveInvestigation(data.investigations[0]);
        }
      })
      .catch((err) => console.log('Local fallback for investigations:', err));
  }, []);

  // Search handler
  const handleSearchTopic = async (topic: string) => {
    setIsSearching(true);
    setCurrentView('explore');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.result) {
          setSearchResult(data.result);
          toast.success(`Loaded research for "${topic}"`);
        }
      } else {
        const fallback = SAMPLE_RESEARCH_RESULTS[topic] || SAMPLE_RESEARCH_RESULTS['Quantum Error Correction'];
        setSearchResult({ ...fallback, query: topic, title: topic });
        toast.info(`Rendered baseline synthesis for "${topic}"`);
      }
    } catch (err) {
      console.warn('Network search notice, using client fallback:', err);
      const fallback = SAMPLE_RESEARCH_RESULTS[topic] || SAMPLE_RESEARCH_RESULTS['Quantum Error Correction'];
      setSearchResult({ ...fallback, query: topic, title: topic });
      toast.info(`Rendered local synthesis for "${topic}"`);
    } finally {
      setIsSearching(false);
    }
  };

  // Source Analyzer handler
  const handleAnalyzeUrl = async (url: string, rawText?: string): Promise<SourceAnalysisResult> => {
    const res = await fetch('/api/analyze-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, rawText })
    });

    if (!res.ok) {
      throw new Error(`Server returned error status: ${res.status}`);
    }

    const data = await res.json();
    return data.analysis;
  };

  // Save analyzed source to workspace
  const handleSaveAnalyzedSource = (analysis: SourceAnalysisResult) => {
    const newSource: ResearchSource = {
      id: `src-analyzed-${Date.now()}`,
      title: analysis.title,
      authors: analysis.authors,
      publishedDate: analysis.publishDate || new Date().toISOString().split('T')[0],
      year: analysis.publishDate ? parseInt(analysis.publishDate.substring(0, 4)) || 2025 : 2025,
      url: analysis.url,
      source: 'Web',
      citations: 12,
      abstract: analysis.executiveSummary,
      type: 'article',
      relevanceScore: 0.95,
      sentimentScore: analysis.sentiment.score,
      entities: analysis.entities.map(e => e.name),
      isOpenAccess: true
    };

    setSourceToSave(newSource);
  };

  // Investigation management handlers
  const handleCreateInvestigation = (
    title: string,
    description: string,
    topic: string,
    tags: string[]
  ) => {
    const newInv: Investigation = {
      id: `inv-${Date.now()}`,
      title,
      description,
      topic,
      tags,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `# ${title}\n\n${description}\n\n### Preliminary Research Questions\n- What are the core operational limits?\n- Which literature benchmarks are statistically verifiable?`,
      savedSources: [],
      savedFindings: [],
      timelineItems: []
    };

    const updatedList = [newInv, ...investigations];
    setInvestigations(updatedList);
    setActiveInvestigation(newInv);
    toast.success(`Created investigation "${title}"`);

    fetch('/api/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInv)
    }).catch(err => console.log('Saved to memory:', err));
  };

  const handleUpdateInvestigation = (updated: Investigation) => {
    const updatedList = investigations.map(i => i.id === updated.id ? updated : i);
    setInvestigations(updatedList);
    if (activeInvestigation?.id === updated.id) {
      setActiveInvestigation(updated);
    }

    fetch(`/api/investigations/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.log('Updated in memory:', err));
  };

  const confirmDeleteInvestigation = () => {
    if (!deleteTargetId) return;
    const remaining = investigations.filter(i => i.id !== deleteTargetId);
    setInvestigations(remaining);
    setActiveInvestigation(remaining[0] || null);

    fetch(`/api/investigations/${deleteTargetId}`, { method: 'DELETE' })
      .catch(err => console.log('Deleted from memory:', err));

    toast.info('Investigation deleted');
    setDeleteTargetId(null);
  };

  const handleDeleteInvestigation = (id: string) => {
    setDeleteTargetId(id);
  };

  // Pin source to selected investigation
  const handleConfirmSaveSource = (investigationId: string, source: ResearchSource) => {
    const target = investigations.find(i => i.id === investigationId);
    if (!target) return;

    if (!target.savedSources.some(s => s.id === source.id)) {
      const updated: Investigation = {
        ...target,
        savedSources: [source, ...target.savedSources],
        updatedAt: new Date().toISOString()
      };
      handleUpdateInvestigation(updated);
      toast.success(`Saved "${source.title}" to ${target.title}`);
    } else {
      toast.info('Source already in workspace');
    }
  };

  // Create new investigation & pin source immediately
  const handleCreateAndSaveSource = (title: string, topic: string, source: ResearchSource) => {
    const newInv: Investigation = {
      id: `inv-${Date.now()}`,
      title,
      description: `Investigation seeded from ${source.title}`,
      topic,
      tags: [topic],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `# ${title}\n\nPrimary literature focus: "${source.title}" (${source.year}).`,
      savedSources: [source],
      savedFindings: [],
      timelineItems: []
    };

    setInvestigations([newInv, ...investigations]);
    setActiveInvestigation(newInv);
    toast.success(`Created workspace & pinned source`);

    fetch('/api/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInv)
    }).catch(err => console.log('Created in memory:', err));
  };

  // Quick save finding to active investigation
  const handleSaveQuickFinding = (title: string, content: string, sourceTitle?: string) => {
    if (!activeInvestigation) return;
    const updated = {
      ...activeInvestigation,
      savedFindings: [
        {
          id: `fnd-${Date.now()}`,
          title,
          content,
          type: 'insight' as const,
          sourceTitle,
          createdAt: new Date().toISOString()
        },
        ...activeInvestigation.savedFindings
      ],
      updatedAt: new Date().toISOString()
    };
    handleUpdateInvestigation(updated);
    toast.success(`Finding added to ${activeInvestigation.title}`);
  };

  // Reset demo data
  const handleResetSeedData = () => {
    setInvestigations(INITIAL_INVESTIGATIONS);
    setActiveInvestigation(INITIAL_INVESTIGATIONS[0]);
    setUserSettings(DEFAULT_USER_SETTINGS);
    toast.info('Reset demo datasets to default state');
  };

  // Recent sources across all investigations and results
  const recentSources: ResearchSource[] = [
    ...(searchResult?.sources || []),
    ...(activeInvestigation?.savedSources || [])
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans text-[#1C241D]">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Header */}
      <Header
        onSearch={handleSearchTopic}
        investigations={investigations}
        activeInvestigation={activeInvestigation}
        onSelectInvestigation={(inv) => {
          setActiveInvestigation(inv);
          setCurrentView('workspace');
        }}
        onCreateInvestigation={() => setIsNewInvModalOpen(true)}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onNavigate={setCurrentView}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <Navigation
          currentView={currentView}
          onNavigate={setCurrentView}
          savedSourcesCount={activeInvestigation?.savedSources.length || 0}
          investigationsCount={investigations.length}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onSearchTopic={handleSearchTopic}
              investigations={investigations}
              onSelectInvestigation={(inv) => {
                setActiveInvestigation(inv);
                setCurrentView('workspace');
              }}
              onCreateInvestigation={() => setIsNewInvModalOpen(true)}
              onNavigate={setCurrentView}
              recentSources={recentSources}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              searchResult={searchResult}
              isLoading={isSearching}
              onSearch={handleSearchTopic}
              onSaveSource={(src) => setSourceToSave(src)}
              onNavigateToGraph={() => setCurrentView('graph')}
              onNavigateToTimeline={() => setCurrentView('timeline')}
              onSaveFinding={handleSaveQuickFinding}
            />
          )}

          {currentView === 'compare' && (
            <PaperComparisonView
              candidateSources={recentSources}
              onSaveFinding={handleSaveQuickFinding}
              onExploreTopic={handleSearchTopic}
            />
          )}

          {currentView === 'graph' && searchResult && (
            <KnowledgeGraphView
              graphData={searchResult.graph}
              topicTitle={searchResult.title}
              onSaveSource={(src) => setSourceToSave(src)}
              onExploreNode={handleSearchTopic}
            />
          )}

          {currentView === 'timeline' && searchResult && (
            <TimelineView
              timelineEvents={searchResult.timeline}
              topicTitle={searchResult.title}
              onSaveFinding={handleSaveQuickFinding}
            />
          )}

          {currentView === 'analyzer' && (
            <SourceAnalyzerView
              onAnalyzeUrl={handleAnalyzeUrl}
              onSaveAnalyzedSource={handleSaveAnalyzedSource}
            />
          )}

          {currentView === 'workspace' && (
            <WorkspaceView
              investigations={investigations}
              activeInvestigation={activeInvestigation}
              onSelectInvestigation={setActiveInvestigation}
              onCreateInvestigation={() => setIsNewInvModalOpen(true)}
              onUpdateInvestigation={handleUpdateInvestigation}
              onDeleteInvestigation={handleDeleteInvestigation}
              onNavigateToExplore={handleSearchTopic}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={userSettings}
              onUpdateSettings={setUserSettings}
              investigations={investigations}
              onImportInvestigations={(imported) => {
                setInvestigations(imported);
                if (imported.length > 0) setActiveInvestigation(imported[0]);
              }}
              onResetSeedData={handleResetSeedData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SaveSourceModal
        isOpen={!!sourceToSave}
        onClose={() => setSourceToSave(null)}
        sourceToSave={sourceToSave}
        investigations={investigations}
        onConfirmSave={handleConfirmSaveSource}
        onCreateAndSave={handleCreateAndSaveSource}
      />

      <NewInvestigationModal
        isOpen={isNewInvModalOpen}
        onClose={() => setIsNewInvModalOpen(false)}
        onCreate={handleCreateInvestigation}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Investigation Workspace"
        message="Are you sure you want to delete this investigation? All associated notes, pinned sources, and findings will be permanently removed."
        confirmLabel="Delete Workspace"
        isDestructive={true}
        onConfirm={confirmDeleteInvestigation}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ToastContainer />
    </div>
  );
}

