import React from 'react';
import {
  LayoutDashboard,
  Search,
  Share2,
  Clock,
  FileSearch,
  FolderGit2,
  Settings,
  Database,
  Activity,
  CheckCircle2,
  ExternalLink,
  GitCompare
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedSourcesCount: number;
  investigationsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  savedSourcesCount,
  investigationsCount,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'explore', label: 'Explore Literature', icon: Search, badge: 'Live' },
    { id: 'compare', label: 'Paper Comparison', icon: GitCompare, badge: 'New' },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2, badge: 'Clusters' },
    { id: 'timeline', label: 'Research Timeline', icon: Clock, badge: null },
    { id: 'analyzer', label: 'PDF & Source Analyzer', icon: FileSearch, badge: 'NLP' },
    { id: 'workspace', label: 'Workspaces', icon: FolderGit2, badge: investigationsCount > 0 ? `${investigationsCount}` : null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-40 w-64 h-full lg:h-[calc(100vh-61px)] bg-[#FBFBF9] border-r border-[#E4E8DF] flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile header inside drawer */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#E4E8DF]">
            <span className="font-semibold text-sm text-[#1C241D]">Navigation Menu</span>
            <button
              onClick={onCloseMobile}
              className="text-xs text-[#586359] hover:text-[#1C241D] p-1 rounded-md"
            >
              Close
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#849085]">
              Intelligence Views
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E6EDE4] text-[#1C241D] font-semibold shadow-2xs'
                      : 'text-[#586359] hover:bg-[#F3F5F0] hover:text-[#1C241D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#42643A]' : 'text-[#849085]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-[#42643A] text-white'
                          : 'bg-[#F3F5F0] text-[#586359] border border-[#E4E8DF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom System & API Status */}
        <div className="pt-4 border-t border-[#E4E8DF] space-y-3">
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E4E8DF] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#1C241D]">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#42643A]" />
                <span>Connected Sources</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[#42643A] bg-[#E6EDE4] px-1.5 py-0.5 rounded font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#42643A] animate-pulse" />
                Active
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-[#586359]">
              <div className="flex items-center justify-between">
                <span>OpenAlex • arXiv • Crossref</span>
                <span className="text-[#42643A] font-mono text-[10px]">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Engine</span>
                <span className="text-[#42643A] font-mono text-[10px]">PostgreSQL / Cache</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 text-[11px] text-[#849085]">
            <span>OpenScope v2.0.0</span>
            <span className="font-mono text-[10px]">MIT License</span>
          </div>
        </div>
      </aside>
    </>
  );
};
