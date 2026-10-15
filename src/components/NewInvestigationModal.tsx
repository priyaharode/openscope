import React, { useState } from 'react';
import { FolderGit2, X, Plus, Tag } from 'lucide-react';
import { Investigation } from '../types';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, topic: string, tags: string[]) => void;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onCreate(title.trim(), description.trim(), topic.trim() || title.trim(), tags);
    setTitle('');
    setDescription('');
    setTopic('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 max-w-lg w-full shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E6EDE4] text-[#42643A] flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#1C241D]">Create New Investigation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849085] hover:text-[#1C241D] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#586359]">Investigation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lithium-Metal Dendrite Suppression Strategies"
              className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#586359]">Target Scientific Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Solid-State Electrolytes"
              className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#586359]">Scope / Abstract / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of research questions, objectives, and parameters..."
              rows={3}
              className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#586359]">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Batteries, Energy Storage, Materials Science"
              className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
            />
          </div>

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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
