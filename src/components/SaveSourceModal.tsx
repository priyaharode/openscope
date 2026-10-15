import React, { useState } from 'react';
import { BookmarkPlus, X, Plus, FolderGit2, Check } from 'lucide-react';
import { Investigation, ResearchSource } from '../types';

interface SaveSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceToSave: ResearchSource | null;
  investigations: Investigation[];
  onConfirmSave: (investigationId: string, source: ResearchSource) => void;
  onCreateAndSave: (title: string, topic: string, source: ResearchSource) => void;
}

export const SaveSourceModal: React.FC<SaveSourceModalProps> = ({
  isOpen,
  onClose,
  sourceToSave,
  investigations,
  onConfirmSave,
  onCreateAndSave
}) => {
  const [selectedInvId, setSelectedInvId] = useState<string>(investigations[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');

  if (!isOpen || !sourceToSave) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      if (!newTitle.trim()) return;
      onCreateAndSave(newTitle.trim(), newTopic.trim() || newTitle.trim(), sourceToSave);
    } else {
      if (!selectedInvId) return;
      onConfirmSave(selectedInvId, sourceToSave);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 max-w-md w-full shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E6EDE4] text-[#42643A] flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#1C241D]">Pin Source to Project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849085] hover:text-[#1C241D] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Source preview */}
        <div className="p-3 bg-[#F9FAF7] rounded-xl border border-[#E4E8DF] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#586359]">{sourceToSave.source} • {sourceToSave.year}</span>
          <h4 className="text-xs font-semibold text-[#1C241D] line-clamp-2">{sourceToSave.title}</h4>
          <p className="text-[11px] text-[#849085] truncate">{sourceToSave.authors.join(', ')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCreatingNew ? (
            <div className="space-y-3">
              <label className="text-xs font-medium text-[#586359] block">Choose Existing Investigation:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {investigations.map((inv) => {
                  const isSelected = selectedInvId === inv.id;
                  const alreadySaved = inv.savedSources.some(s => s.id === sourceToSave.id);
                  return (
                    <div
                      key={inv.id}
                      onClick={() => !alreadySaved && setSelectedInvId(inv.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#42643A] bg-[#E6EDE4] text-[#2C3E28] font-medium'
                          : alreadySaved
                          ? 'border-[#E4E8DF] bg-[#F9FAF7] opacity-60 cursor-not-allowed text-[#849085]'
                          : 'border-[#E4E8DF] hover:bg-[#F4F7F3] text-[#1C241D]'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="block truncate">{inv.title}</span>
                        <span className="text-[10px] text-[#849085] truncate">{inv.topic}</span>
                      </div>
                      {alreadySaved ? (
                        <span className="text-[10px] text-[#586359] shrink-0 font-mono">Already Pinned</span>
                      ) : isSelected ? (
                        <Check className="w-4 h-4 text-[#42643A] shrink-0" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-2 text-center text-xs text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center justify-center gap-1 border border-dashed border-[#D0DEC9] rounded-xl hover:bg-[#E6EDE4]/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Investigation Instead</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#586359]">New Investigation Details</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-[#42643A] hover:underline"
                >
                  Choose Existing
                </button>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Project title (e.g. Scalable Surface Code Decoders)"
                  className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs text-[#1C241D] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Scientific Topic (e.g. Quantum Error Correction)"
                  className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs text-[#1C241D] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8DF]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#586359] hover:bg-[#F3F5F0] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Confirm Pin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
