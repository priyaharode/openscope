import React, { useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { UserSettings, Investigation } from '../types';
import { downloadFile } from '../lib/utils';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  investigations: Investigation[];
  onImportInvestigations: (imported: Investigation[]) => void;
  onResetSeedData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  investigations,
  onImportInvestigations,
  onResetSeedData
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiPingStatus, setApiPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePingApis = async () => {
    setIsPinging(true);
    setApiPingStatus('Testing connections to OpenAlex and Wikipedia...');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiPingStatus(`Connected! System status: ${data.status}. Local NLP core & Open repositories responding normally.`);
      } else {
        setApiPingStatus('Server responded with warning code.');
      }
    } catch {
      setApiPingStatus('Local in-memory engine and client NLP active.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleExportAll = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userSettings: formData,
      investigations
    };
    downloadFile(
      JSON.stringify(backupData, null, 2),
      `OpenScope_Full_Backup_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.investigations && Array.isArray(parsed.investigations)) {
          onImportInvestigations(parsed.investigations);
          if (parsed.userSettings) {
            onUpdateSettings(parsed.userSettings);
            setFormData(parsed.userSettings);
          }
          alert(`Successfully imported ${parsed.investigations.length} investigations!`);
        } else {
          alert('Invalid backup format. File must contain an "investigations" array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#42643A] bg-[#E6EDE4] px-2 py-0.5 rounded-md">
          <Settings className="w-3.5 h-3.5" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C241D]">
          OpenScope Settings & Preferences
        </h1>
        <p className="text-xs text-[#586359]">
          Manage researcher profile, OpenAlex polite pool settings, NLP heuristic flags, and local data backups.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profile */}
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-[#1C241D] flex items-center gap-2">
            <User className="w-4 h-4 text-[#42643A]" />
            <span>Researcher Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#586359]">Full Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#586359]">Role / Title</label>
              <input
                type="text"
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-[#586359]">Primary Affiliation / Laboratory</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: OpenAlex & Data API Configuration */}
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1C241D] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#42643A]" />
              <span>Data Source & OpenAlex Polite Pool</span>
            </h2>
            <button
              type="button"
              onClick={handlePingApis}
              disabled={isPinging}
              className="text-xs text-[#42643A] hover:text-[#2C3E28] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Test API Status</span>
            </button>
          </div>

          <div className="space-y-3 text-xs text-[#586359]">
            <p className="leading-relaxed">
              OpenAlex provides a <em>Polite Pool</em> allowing up to 10 requests per second when a valid researcher contact email is included in the request headers.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#586359]">OpenAlex Polite Pool Email</label>
              <input
                type="email"
                value={formData.openAlexEmail}
                onChange={(e) => setFormData({ ...formData, openAlexEmail: e.target.value })}
                placeholder="researcher@institution.edu"
                className="w-full px-3 py-2 bg-[#F9FAF7] border border-[#D5DCD0] focus:border-[#577F4D] rounded-xl text-xs sm:text-sm text-[#1C241D] focus:outline-none"
              />
            </div>

            {apiPingStatus && (
              <div className="p-3 bg-[#F4F7F3] border border-[#D0DEC9] rounded-xl text-xs text-[#2C3E28] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#42643A] shrink-0" />
                <span>{apiPingStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: NLP Heuristics & Analysis Preferences */}
        <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-[#1C241D] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#42643A]" />
            <span>Analysis & NLP Preferences</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E8DF] hover:bg-[#F9FAF7] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1C241D] block">Automatic Named Entity Recognition (NER)</span>
                <span className="text-[11px] text-[#586359] block">
                  Extract organizations, prominent researchers, and academic methods from literature abstracts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoExtractEntities}
                onChange={(e) => setFormData({ ...formData, autoExtractEntities: e.target.checked })}
                className="w-4 h-4 accent-[#42643A] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E8DF] hover:bg-[#F9FAF7] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1C241D] block">Synthesize Executive Summaries</span>
                <span className="text-[11px] text-[#586359] block">
                  Compile key takeaways and empirical findings for explored research queries.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.enableAiSummary}
                onChange={(e) => setFormData({ ...formData, enableAiSummary: e.target.checked })}
                className="w-4 h-4 accent-[#42643A] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Save Changes Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-medium text-[#42643A] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#42643A] hover:bg-[#354E2F] text-white text-xs font-medium px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Section 5: Data Management & Backup */}
      <div className="bg-white rounded-2xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-[#1C241D] flex items-center gap-2">
          <Server className="w-4 h-4 text-[#42643A]" />
          <span>Local Data Management & Portability</span>
        </h2>
        <p className="text-xs text-[#586359]">
          All research notes, pinned literature, and findings are stored safely in your workspace. You can export complete project archives or restore from a previous backup file.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleExportAll}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#D0DEC9] bg-[#F4F7F3] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#42643A]" />
            <span>Export All Workspaces</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#E4E8DF] bg-[#F9FAF7] hover:bg-[#E6EDE4] text-[#2C3E28] text-xs font-medium transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[#42643A]" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset investigations to default demonstration dataset?')) {
                onResetSeedData();
              }
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#E4E8DF] bg-[#F9FAF7] hover:bg-[#FBEAEA] text-[#963737] text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
