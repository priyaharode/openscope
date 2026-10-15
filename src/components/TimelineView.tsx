import React, { useState } from 'react';
import { Clock, Calendar, ExternalLink, Sparkles, Filter, BookmarkPlus, ArrowUpRight } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineViewProps {
  timelineEvents: TimelineEvent[];
  topicTitle: string;
  onSaveFinding?: (title: string, content: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  timelineEvents,
  topicTitle,
  onSaveFinding
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories = ['ALL', 'Breakthrough', 'Publication', 'Methodology', 'Patent', 'Debate'];

  const filteredEvents = timelineEvents
    .filter(e => selectedCategory === 'ALL' || e.category === selectedCategory)
    .sort((a, b) => sortOrder === 'asc' ? a.year - b.year : b.year - a.year);

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Breakthrough: { bg: 'bg-[#E6EDE4]', text: 'text-[#2C3E28]', border: 'border-[#D0DEC9]' },
    Publication: { bg: 'bg-[#F4F7F3]', text: 'text-[#42643A]', border: 'border-[#D5DCD0]' },
    Methodology: { bg: 'bg-[#FAF3E3]', text: 'text-[#8A6B29]', border: 'border-[#EADBBE]' },
    Patent: { bg: 'bg-[#F3F5F0]', text: 'text-[#586359]', border: 'border-[#E4E8DF]' },
    Debate: { bg: 'bg-[#FBEAEA]', text: 'text-[#963737]', border: 'border-[#F2CCCC]' }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#42643A] bg-[#E6EDE4] px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>Chronological Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C241D]">
              Research Timeline: {topicTitle}
            </h1>
            <p className="text-xs text-[#586359]">
              Tracing foundational theories, experimental breakthroughs, and recent publications across history.
            </p>
          </div>

          {/* Sort order toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-xs px-3 py-1.5 rounded-xl border border-[#D5DCD0] bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] font-medium transition-colors cursor-pointer"
            >
              Order: {sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E4E8DF]">
          <span className="text-xs text-[#849085] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter by Era / Type:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#42643A] text-white font-medium shadow-2xs'
                  : 'bg-[#F4F7F3] text-[#586359] hover:bg-[#E6EDE4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-12 text-center text-[#849085] space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-[#D0DEC9]" />
          <p className="text-sm font-medium">No timeline events matched the filter.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#D0DEC9] space-y-8 my-6 ml-4 sm:ml-6">
          {filteredEvents.map((evt, idx) => {
            const catStyle = categoryColors[evt.category] || categoryColors.Publication;
            const isHighSignificance = evt.significance === 'high';

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node circle on timeline line */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isHighSignificance
                      ? 'border-[#42643A] ring-4 ring-[#E6EDE4]'
                      : 'border-[#ABC4A1]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isHighSignificance ? 'bg-[#42643A]' : 'bg-[#ABC4A1]'
                    }`}
                  />
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-2xl border border-[#E4E8DF] hover:border-[#D0DEC9] p-5 shadow-xs space-y-2.5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1C241D] bg-[#F4F7F3] px-2 py-0.5 rounded border border-[#E4E8DF]">
                        {evt.year}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {evt.category}
                      </span>
                      {isHighSignificance && (
                        <span className="text-[10px] bg-[#FAF3E3] text-[#8A6B29] border border-[#EADBBE] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Key Milestone
                        </span>
                      )}
                    </div>

                    {evt.sourceUrl && (
                      <a
                        href={evt.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#42643A] hover:text-[#2C3E28] font-medium inline-flex items-center gap-1"
                      >
                        <span>Original Citation</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-[#1C241D] leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#586359] leading-relaxed">
                    {evt.description}
                  </p>

                  {evt.sourceTitle && (
                    <div className="text-[11px] text-[#849085] pt-2 border-t border-[#E4E8DF] flex items-center justify-between">
                      <span className="truncate max-w-md">Source: {evt.sourceTitle}</span>
                      {onSaveFinding && (
                        <button
                          onClick={() => onSaveFinding(evt.title, evt.description)}
                          className="text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <BookmarkPlus className="w-3 h-3" />
                          <span>Pin to Notes</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
