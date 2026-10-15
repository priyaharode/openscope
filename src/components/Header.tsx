import React, { useState } from 'react';
import { Search, Compass, Plus, Sparkles, FolderGit2, Menu, X, BookOpen, ExternalLink } from 'lucide-react';
import { Investigation } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  onSelectInvestigation: (inv: Investigation) => void;
  onCreateInvestigation: () => void;
  onOpenMobileNav: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  investigations,
  activeInvestigation,
  onSelectInvestigation,
  onCreateInvestigation,
  onOpenMobileNav,
  onNavigate
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showInvDropdown, setShowInvDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('explore');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-[#E4E8DF] px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Nav Button + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg text-[#586359] hover:bg-[#EBF0EA] hover:text-[#283B2E] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#42643A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#354E2F] transition-colors">
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-[#1C241D]">OpenScope</span>
                <span className="text-[10px] font-medium bg-[#E6EDE4] text-[#354E2F] px-1.5 py-0.5 rounded-md border border-[#D0DEC9]">
                  OSS Intelligence
                </span>
              </div>
              <p className="text-[11px] text-[#636B63] hidden sm:block">Open-Source Research Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <Search className="w-4 h-4 text-[#849085] absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#42643A] transition-colors" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search papers, concepts, authors (e.g. Quantum Error Correction)..."
              className="w-full bg-[#FFFFFF] border border-[#D5DCD0] focus:border-[#577F4D] focus:ring-2 focus:ring-[#D0DEC9]/60 rounded-xl pl-10 pr-16 py-2 text-sm text-[#1C241D] placeholder-[#849085] transition-all shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[11px] font-mono text-[#849085] bg-[#F3F5F0] border border-[#E4E8DF] px-1.5 py-0.5 rounded">
                ↵
              </span>
            </div>
          </div>
        </form>

        {/* Right: Workspace Selector & Quick Action */}
        <div className="flex items-center gap-2.5">
          {/* Active Investigation Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowInvDropdown(!showInvDropdown)}
              className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E4E8DF] hover:border-[#D0DEC9] text-[#283B2E] text-xs font-medium px-3 py-2 rounded-xl shadow-xs hover:bg-[#F9FAF7] transition-all"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#577F4D]" />
              <span className="max-w-[120px] truncate">
                {activeInvestigation ? activeInvestigation.title : 'Workspace'}
              </span>
              <span className="text-[10px] text-[#849085] bg-[#F4F7F3] px-1.5 py-0.5 rounded border border-[#E4E8DF]">
                {investigations.length}
              </span>
            </button>

            {showInvDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E4E8DF] p-2 z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-[#849085] uppercase tracking-wider flex items-center justify-between">
                  <span>Investigations</span>
                  <span className="text-[10px] font-normal">{investigations.length} Active</span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 my-1">
                  {investigations.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        onSelectInvestigation(inv);
                        setShowInvDropdown(false);
                        onNavigate('workspace');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                        activeInvestigation?.id === inv.id
                          ? 'bg-[#E6EDE4] text-[#283B2E] font-medium'
                          : 'hover:bg-[#F4F7F3] text-[#586359]'
                      }`}
                    >
                      <span className="truncate">{inv.title}</span>
                      <span className="text-[10px] text-[#849085] truncate">{inv.topic}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#E4E8DF]">
                  <button
                    onClick={() => {
                      setShowInvDropdown(false);
                      onCreateInvestigation();
                    }}
                    className="w-full text-center py-1.5 px-2 rounded-lg bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#354E2F] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Investigation</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Investigation Button */}
          <button
            onClick={onCreateInvestigation}
            className="flex items-center gap-1.5 bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};
