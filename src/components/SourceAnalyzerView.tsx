import React, { useState, useRef } from 'react';
import {
  FileSearch,
  Globe,
  FileText,
  UploadCloud,
  Sparkles,
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Hash,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { SourceAnalysisResult, Investigation } from '../types';
import { useToast } from './Toast';

interface SourceAnalyzerViewProps {
  onAnalyzeUrl: (url: string, rawText?: string) => Promise<SourceAnalysisResult>;
  onSaveAnalyzedSource: (analysis: SourceAnalysisResult, investigationId?: string) => void;
  investigations?: Investigation[];
}

export const SourceAnalyzerView: React.FC<SourceAnalyzerViewProps> = ({
  onAnalyzeUrl,
  onSaveAnalyzedSource,
  investigations = []
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'pdf'>('pdf');
  const [urlInput, setUrlInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SourceAnalysisResult | null>(null);

  // Investigation selection for saving
  const [targetInvId, setTargetInvId] = useState<string>(investigations[0]?.id || '');
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0);

  const sampleUrls = [
    { label: 'Nature Quantum QEC Article', url: 'https://www.nature.com/articles/s41586-022-05434-1' },
    { label: 'arXiv Machine Learning Preprint', url: 'https://arxiv.org/abs/1706.03762' },
    { label: 'Wikipedia Quantum Error Correction', url: 'https://en.wikipedia.org/wiki/Quantum_error_correction' }
  ];

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Only PDF manuscripts (.pdf) are supported', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('File exceeds 15MB upload limit', 'error');
      return;
    }
    setSelectedFile(file);
    setErrorMsg(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'url' && !urlInput.trim()) {
      setErrorMsg('Please provide a valid public URL to analyze.');
      return;
    }
    if (activeTab === 'text' && !rawTextInput.trim()) {
      setErrorMsg('Please paste text or paper abstract to analyze.');
      return;
    }
    if (activeTab === 'pdf' && !selectedFile) {
      setErrorMsg('Please select or drop a PDF manuscript.');
      return;
    }

    setIsAnalyzing(true);
    try {
      if (activeTab === 'pdf') {
        const formData = new FormData();
        formData.append('file', selectedFile!);

        const res = await fetch('/api/analyze-pdf', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        const pdfAnalysis = data.analysis;

        const formattedResult: SourceAnalysisResult = {
          url: selectedFile!.name,
          title: pdfAnalysis.title,
          authors: pdfAnalysis.authors,
          publishDate: pdfAnalysis.pdfInfo?.creationDate || new Date().toISOString().split('T')[0],
          sourceType: 'PDF Manuscript',
          domain: 'Uploaded Document',
          wordCount: pdfAnalysis.wordCount,
          readingTimeMinutes: pdfAnalysis.readingTimeMinutes,
          readability: pdfAnalysis.readability,
          sentiment: pdfAnalysis.sentiment,
          keywords: pdfAnalysis.keywords,
          executiveSummary: pdfAnalysis.abstract || 'Structured abstract extracted from PDF manuscript.',
          keyFindings: pdfAnalysis.keyFindings,
          entities: pdfAnalysis.entities,
          citations: pdfAnalysis.references,
          sections: pdfAnalysis.sections,
          pageCount: pdfAnalysis.pageCount,
          extractedTextPreview: pdfAnalysis.extractedTextPreview
        };

        setResult(formattedResult);
        showToast('PDF manuscript analyzed successfully', 'success');
      } else {
        const data = await onAnalyzeUrl(
          activeTab === 'url' ? urlInput.trim() : '',
          activeTab === 'text' ? rawTextInput.trim() : undefined
        );
        setResult(data);
        showToast('Source analyzed successfully', 'success');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze source. Please check the input or file.');
      showToast('Analysis failed', 'error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result) {
      onSaveAnalyzedSource(result, targetInvId || undefined);
      showToast('Source pinned to investigation', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header card */}
      <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#42643A] bg-[#E6EDE4] px-2.5 py-0.5 rounded-md">
            <FileSearch className="w-3.5 h-3.5" />
            <span>Deep Source Extraction</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1C241D]">
            Source & PDF Manuscript Analyzer
          </h1>
          <p className="text-xs text-[#586359]">
            Extract academic metadata, section hierarchies, linguistic readability, NLP sentiment stance, key entities, and executive takeaways from any PDF manuscript, URL, or raw text.
          </p>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex items-center gap-3 border-b border-[#E4E8DF] pt-2">
          <button
            onClick={() => { setActiveTab('pdf'); setErrorMsg(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pdf'
                ? 'border-[#42643A] text-[#42643A]'
                : 'border-transparent text-[#849085] hover:text-[#1C241D]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>PDF Manuscript</span>
          </button>
          <button
            onClick={() => { setActiveTab('url'); setErrorMsg(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#42643A] text-[#42643A]'
                : 'border-transparent text-[#849085] hover:text-[#1C241D]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Analyze Web URL</span>
          </button>
          <button
            onClick={() => { setActiveTab('text'); setErrorMsg(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#42643A] text-[#42643A]'
                : 'border-transparent text-[#849085] hover:text-[#1C241D]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Direct Text / Abstract</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-3 pt-2">
          {activeTab === 'pdf' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    validateAndSetFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                  isDragging
                    ? 'border-[#42643A] bg-[#E6EDE4]/40'
                    : selectedFile
                    ? 'border-[#42643A]/60 bg-[#E6EDE4]/20'
                    : 'border-[#D5DCD0] hover:border-[#42643A]/50 bg-[#F9FAF7]'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#E6EDE4] text-[#42643A] flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C241D]">{selectedFile.name}</p>
                      <p className="text-xs text-[#849085] mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </p>
                    </div>
                    <span className="text-[11px] text-[#42643A] font-medium underline mt-1">
                      Click to choose another PDF
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#EFEFEA] text-[#586359] flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C241D]">
                        Drop your research PDF here, or <span className="text-[#42643A] font-semibold underline">browse</span>
                      </p>
                      <p className="text-xs text-[#849085] mt-1">
                        Extracts structured titles, authors, abstract, sections, references, and linguistic metrics (Max 15MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="relative">
                <Globe className="w-4 h-4 text-[#849085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://nature.com/articles/..., https://arxiv.org/abs/..., or any public article"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5DCD0] focus:border-[#42643A] rounded-xl text-xs text-[#1C241D] placeholder-[#849085] focus:outline-none transition-all"
                />
              </div>

              {/* Sample URL quick buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#849085]">Examples:</span>
                {sampleUrls.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUrlInput(s.url)}
                    className="text-[11px] px-2 py-0.5 bg-[#EFEFEA] hover:bg-[#E6EDE4] text-[#42643A] rounded-md transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-2">
              <textarea
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="Paste scholarly article text, conference abstract, or technical paper manuscript here..."
                rows={5}
                className="w-full p-3 bg-white border border-[#D5DCD0] focus:border-[#42643A] rounded-xl text-xs text-[#1C241D] placeholder-[#849085] focus:outline-none transition-all leading-relaxed"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#849085]">
              Local heuristics + NLP parsing pipeline
            </span>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-[#42643A] hover:bg-[#35522e] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Metadata & Corpus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{activeTab === 'pdf' ? 'Analyze PDF Manuscript' : 'Analyze Source'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main overview banner */}
          <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E6EDE4] text-[#42643A]">
                    {result.sourceType}
                  </span>
                  <span className="text-[11px] text-[#849085]">
                    {result.domain}
                  </span>
                  {result.pageCount && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF3E3] text-[#8C5A32] border border-[#E4E8DF]">
                      {result.pageCount} Pages
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-[#1C241D] leading-snug">
                  {result.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#586359]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#849085]" />
                    <span>{result.authors.slice(0, 3).join(', ')}{result.authors.length > 3 ? ' et al.' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#849085]" />
                    <span>Published: {result.publishDate}</span>
                  </div>
                </div>
              </div>

              {/* Save to Investigation controls */}
              <div className="flex items-center gap-2 shrink-0">
                {investigations.length > 0 && (
                  <select
                    value={targetInvId}
                    onChange={(e) => setTargetInvId(e.target.value)}
                    className="text-xs bg-white border border-[#E4E8DF] rounded-lg px-2.5 py-1.5 text-[#1C241D] focus:outline-none focus:ring-1 focus:ring-[#42643A]"
                  >
                    {investigations.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        Save to: {inv.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-[#42643A] hover:bg-[#35522e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Source</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E4E8DF]">
              <div className="p-3 bg-white rounded-lg border border-[#E4E8DF] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#849085]">Readability Ease</span>
                <div className="text-base font-bold text-[#1C241D]">
                  {result.readability.fleschKincaidScore} / 100
                </div>
                <span className="text-[10px] text-[#42643A] font-medium block truncate">
                  {result.readability.readingEase}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E4E8DF] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#849085]">Grade Level</span>
                <div className="text-base font-bold text-[#1C241D]">
                  {result.readability.gradeLevel}
                </div>
                <span className="text-[10px] text-[#586359] block">
                  Flesch-Kincaid scale
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E4E8DF] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#849085]">Corpus Length</span>
                <div className="text-base font-bold text-[#1C241D]">
                  {result.wordCount.toLocaleString()} words
                </div>
                <span className="text-[10px] text-[#586359] block">
                  ~{result.readingTimeMinutes} min reading time
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E4E8DF] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#849085]">Sentiment Stance</span>
                <div className="text-base font-bold text-[#1C241D] truncate">
                  {result.sentiment.label}
                </div>
                <span className="text-[10px] text-[#586359] block truncate" title={result.sentiment.toneDescription}>
                  {result.sentiment.toneDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Abstract & Key Takeaways */}
          <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-xs text-[#1C241D] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#42643A]" />
              <span>Abstract & Executive Takeaways</span>
            </h3>

            <p className="text-xs text-[#1C241D] leading-relaxed bg-white p-4 rounded-xl border border-[#E4E8DF]">
              {result.executiveSummary}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-[#42643A] uppercase tracking-wider">
                Key Extracted Findings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.keyFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-[#E4E8DF] text-xs text-[#1C241D] leading-relaxed flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#42643A] mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted Document Sections (PDF Manuscripts) */}
          {result.sections && result.sections.length > 0 && (
            <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-[#1C241D] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#42643A]" />
                  <span>Extracted Structural Sections ({result.sections.length})</span>
                </h3>
                <span className="text-[11px] text-[#849085]">
                  Click section to expand full text
                </span>
              </div>

              <div className="divide-y divide-[#E4E8DF] border border-[#E4E8DF] rounded-xl overflow-hidden bg-white">
                {result.sections.map((section, sIdx) => {
                  const isOpen = openSectionIdx === sIdx;
                  return (
                    <div key={sIdx} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#FAF3E3]/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1C241D]">{section.title}</span>
                          <span className="text-[10px] text-[#849085] bg-[#EFEFEA] px-2 py-0.5 rounded">
                            {section.wordCount} words
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#849085]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#849085]" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 py-3.5 bg-[#FAF3E3]/20 border-t border-[#E4E8DF] text-xs text-[#3A453C] leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
                          {section.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keywords & Identified Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keywords */}
            <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-3">
              <h3 className="font-semibold text-xs text-[#1C241D] uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#42643A]" />
                <span>Salient Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#E4E8DF] text-xs font-medium text-[#42643A]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Entities */}
            <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-3">
              <h3 className="font-semibold text-xs text-[#1C241D] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#42643A]" />
                <span>Extracted Entities ({result.entities.length})</span>
              </h3>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {result.entities.map((ent) => (
                  <div
                    key={ent.id}
                    className="p-2 rounded-lg bg-white border border-[#E4E8DF] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E6EDE4] text-[#42643A]">
                        {ent.type}
                      </span>
                      <span className="font-medium text-[#1C241D]">{ent.name}</span>
                    </div>
                    {ent.wikipediaUrl && (
                      <a
                        href={ent.wikipediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#849085] hover:text-[#42643A]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* References & Bibliography */}
          {result.citations.length > 0 && (
            <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-5 shadow-xs space-y-3">
              <h3 className="font-semibold text-xs text-[#1C241D] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#42643A]" />
                <span>Bibliographic References ({result.citations.length})</span>
              </h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto text-xs text-[#586359]">
                {result.citations.map((cite, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-[#E4E8DF] flex items-start gap-2">
                    <span className="text-[10px] font-mono text-[#849085] mt-0.5">[{idx + 1}]</span>
                    <span>{cite}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
