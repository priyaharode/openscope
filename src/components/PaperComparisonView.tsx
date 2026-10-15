import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  BookOpen,
  Calendar,
  Award,
  Lock,
  Unlock,
  BookmarkPlus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ResearchSource, PaperComparison } from '../types';
import { useToast } from './Toast';

interface PaperComparisonViewProps {
  availableSources?: ResearchSource[];
  candidateSources?: ResearchSource[];
  onSaveFinding?: (title: string, content: string, sourceTitle?: string) => void;
  onExploreTopic?: (topic: string) => void;
}

const BENCHMARK_PRESETS: Array<{ label: string; paperA: ResearchSource; paperB: ResearchSource }> = [
  {
    label: 'Surface Codes vs Floquet Topological Codes',
    paperA: {
      id: 'preset-surface-code',
      title: 'Suppressing Quantum Errors by Scaling a Quantum Error-Correcting Code',
      authors: ['Google Quantum AI Consortium', 'R. Barends', 'A. Megrant'],
      publishedDate: '2023-02-22',
      year: 2023,
      url: 'https://doi.org/10.1038/s41586-022-05434-1',
      doi: '10.1038/s41586-022-05434-1',
      source: 'OpenAlex',
      venue: 'Nature',
      citations: 342,
      abstract: 'Demonstrating that increasing the code distance from d=3 to d=5 reduces logical error rates below physical qubit error thresholds on superconducting transmon processors.',
      type: 'journal',
      relevanceScore: 0.99,
      sentimentScore: 0.35,
      entities: ['Google Quantum AI', 'Surface Code', 'Syndrome Extraction'],
      isOpenAccess: true
    },
    paperB: {
      id: 'preset-floquet-code',
      title: 'Fault-Tolerant Quantum Computation with Static and Dynamic Floquet Color Codes',
      authors: ['M. Hastings', 'A. Haah', 'Quantinuum Science Team'],
      publishedDate: '2024-04-12',
      year: 2024,
      url: 'https://arxiv.org/abs/2107.02194',
      doi: '10.48550/arXiv.2107.02194',
      source: 'arXiv',
      venue: 'arXiv:quant-ph',
      citations: 118,
      abstract: 'Investigating dynamic measurement schedules in 2D Floquet codes that eliminate two-qubit check measurements while retaining topological error protection at lower circuit depths.',
      type: 'preprint',
      relevanceScore: 0.96,
      sentimentScore: 0.28,
      entities: ['Floquet Code', 'Quantinuum', 'Color Code'],
      isOpenAccess: true
    }
  },
  {
    label: 'Sulfide vs Oxide Solid-State Electrolytes',
    paperA: {
      id: 'preset-sulfide',
      title: 'High Lithium Ionic Conductivity in Argyrodite Sulfide Solid Electrolytes',
      authors: ['Y. Kato', 'S. Hori', 'R. Kanno'],
      publishedDate: '2022-06-15',
      year: 2022,
      url: 'https://doi.org/10.1038/nenergy.2016.30',
      source: 'Crossref',
      venue: 'Nature Energy',
      citations: 512,
      abstract: 'Sulfide-based superionic conductors exhibit exceptional room-temperature lithium-ion conductivity exceeding 10 mS/cm, enabling high-rate all-solid-state lithium batteries.',
      type: 'journal',
      relevanceScore: 0.97,
      sentimentScore: 0.4,
      entities: ['Argyrodite', 'Lithium Conductivity', 'Sulfide Electrolyte'],
      isOpenAccess: false
    },
    paperB: {
      id: 'preset-oxide',
      title: 'Garnet-Type Ceramic Electrolytes for Dendrite-Resistant Lithium Metal Anodes',
      authors: ['L. van Wüllen', 'E. Wachsman'],
      publishedDate: '2023-11-04',
      year: 2023,
      url: 'https://doi.org/10.1016/j.ensm.2023.102891',
      source: 'OpenAlex',
      venue: 'Energy Storage Materials',
      citations: 215,
      abstract: 'Oxide garnet LLZO materials exhibit superior chemical stability against pure lithium metal and elevated air tolerance, though grain-boundary interface resistance remains a challenge.',
      type: 'journal',
      relevanceScore: 0.94,
      sentimentScore: 0.18,
      entities: ['LLZO', 'Garnet Oxide', 'Lithium Dendrite'],
      isOpenAccess: true
    }
  }
];

export const PaperComparisonView: React.FC<PaperComparisonViewProps> = ({
  availableSources,
  candidateSources,
  onSaveFinding,
  onExploreTopic
}) => {
  const { showToast } = useToast();

  const allSources = candidateSources || availableSources || [];

  const [selectedPaperA, setSelectedPaperA] = useState<ResearchSource>(
    allSources[0] || BENCHMARK_PRESETS[0].paperA
  );
  const [selectedPaperB, setSelectedPaperB] = useState<ResearchSource>(
    allSources[1] || BENCHMARK_PRESETS[0].paperB
  );

  const [comparisonResult, setComparisonResult] = useState<PaperComparison | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const handleApplyPreset = (preset: typeof BENCHMARK_PRESETS[0]) => {
    setSelectedPaperA(preset.paperA);
    setSelectedPaperB(preset.paperB);
    setComparisonResult(null);
  };

  const handleRunComparison = async () => {
    if (!selectedPaperA || !selectedPaperB) {
      showToast('Select both Paper A and Paper B', 'error');
      return;
    }

    if (selectedPaperA.id === selectedPaperB.id) {
      showToast('Please select two distinct papers to compare', 'error');
      return;
    }

    setIsComparing(true);
    try {
      const res = await fetch('/api/compare-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperA: selectedPaperA, paperB: selectedPaperB })
      });

      if (!res.ok) {
        throw new Error(`Comparison service returned HTTP ${res.status}`);
      }

      const data: PaperComparison = await res.json();
      setComparisonResult(data);
      showToast('Comparative synthesis completed', 'success');
    } catch (err: any) {
      console.error('Comparison error:', err);
      showToast('Failed to compare papers', 'error', err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!comparisonResult) return;
    const c = comparisonResult.comparison;
    const pA = comparisonResult.paperA;
    const pB = comparisonResult.paperB;

    const markdown = `# Comparative Literature Synthesis
Generated by OpenScope Research Intelligence

## Paper A: ${pA.title}
- **Authors**: ${pA.authors.join(', ')}
- **Year**: ${pA.year}
- **Repository**: ${pA.source} (${pA.venue || 'N/A'})
- **Citations**: ${pA.citations}

## Paper B: ${pB.title}
- **Authors**: ${pB.authors.join(', ')}
- **Year**: ${pB.year}
- **Repository**: ${pB.source} (${pB.venue || 'N/A'})
- **Citations**: ${pB.citations}

---

## 1. Executive Synthesis Takeaway
${c.summaryTakeaway}

## 2. Research Questions
- **${pA.title.slice(0, 30)}...**: ${c.researchQuestion.a}
- **${pB.title.slice(0, 30)}...**: ${c.researchQuestion.b}
- **Synthesis**: ${c.researchQuestion.synthesis}

## 3. Methodology & Experimental Architecture
- **Paper A**: ${c.methodology.a}
- **Paper B**: ${c.methodology.b}
- **Synthesis**: ${c.methodology.synthesis}

## 4. Dataset & Physical Testbed
- **Paper A**: ${c.datasetSample.a}
- **Paper B**: ${c.datasetSample.b}

## 5. Findings & Empirical Benchmarks
- **Paper A**: ${c.findings.a}
- **Paper B**: ${c.findings.b}

## 6. Limitations & Caveats
- **Paper A**: ${c.limitations.a}
- **Paper B**: ${c.limitations.b}

## 7. Areas of Agreement
${c.areasOfAgreement.map(a => `- ${a}`).join('\n')}

## 8. Areas of Disagreement & Divergence
${c.areasOfDisagreement.map(d => `- ${d}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenScope-Comparison-${pA.year}-${pB.year}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Comparative Dossier downloaded (.md)', 'success');
  };

  const handleSaveToInvestigation = () => {
    if (!comparisonResult || !onSaveFinding) return;
    const title = `Synthesis: ${comparisonResult.paperA.title.slice(0, 25)} vs ${comparisonResult.paperB.title.slice(0, 25)}`;
    const content = `${comparisonResult.comparison.summaryTakeaway}\n\nAgreement:\n${comparisonResult.comparison.areasOfAgreement.join('; ')}\n\nDisagreement:\n${comparisonResult.comparison.areasOfDisagreement.join('; ')}`;
    onSaveFinding(title, content, `${comparisonResult.paperA.title} & ${comparisonResult.paperB.title}`);
    showToast('Comparison logged to active investigation finding', 'success');
  };

  // Combine unique choices for dropdown
  const allChoices = [...BENCHMARK_PRESETS.flatMap(p => [p.paperA, p.paperB]), ...availableSources];
  const uniqueChoices = Array.from(new Map(allChoices.map(c => [c.title, c])).values());

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EDE4] text-[#42643A] flex items-center justify-center shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1C241D]">Paper Comparison & Literature Synthesis</h1>
              <p className="text-xs text-[#586359] mt-0.5">
                Side-by-side analytical evaluation of research questions, methodologies, datasets, empirical benchmarks, and divergence.
              </p>
            </div>
          </div>

          {/* Quick Benchmark Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-[#849085] mr-1">Presets:</span>
            {BENCHMARK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 text-[11px] font-medium bg-[#EFEFEA] hover:bg-[#E6EDE4] text-[#42643A] rounded-md transition-colors border border-[#E4E8DF]"
              >
                {preset.label.split(' vs ')[0]} vs {preset.label.split(' vs ')[1]?.slice(0, 10)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selector Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paper A Selector Card */}
        <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#42643A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#42643A]"></span> Paper A
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedPaperA.source === 'arXiv'
                ? 'bg-amber-100 text-amber-800'
                : selectedPaperA.source === 'Crossref'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-[#E6EDE4] text-[#42643A]'
            }`}>
              {selectedPaperA.source}
            </span>
          </div>

          <select
            value={selectedPaperA.title}
            onChange={(e) => {
              const hit = uniqueChoices.find(c => c.title === e.target.value);
              if (hit) setSelectedPaperA(hit);
            }}
            className="w-full text-xs font-medium bg-white border border-[#E4E8DF] rounded-lg p-2.5 text-[#1C241D] focus:outline-none focus:ring-1 focus:ring-[#42643A]"
          >
            {uniqueChoices.map((c, i) => (
              <option key={i} value={c.title}>
                [{c.source}] ({c.year}) {c.title.slice(0, 75)}...
              </option>
            ))}
          </select>

          <div className="text-xs text-[#586359] space-y-1 bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
            <p className="font-semibold text-[#1C241D] line-clamp-2">{selectedPaperA.title}</p>
            <p className="text-[11px] text-[#849085]">
              {selectedPaperA.authors.slice(0, 3).join(', ')} • {selectedPaperA.year} • {selectedPaperA.citations} citations
            </p>
            <p className="text-[11px] line-clamp-2 italic text-[#586359] mt-1">
              "{selectedPaperA.abstract}"
            </p>
          </div>
        </div>

        {/* Paper B Selector Card */}
        <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2C5E7A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2C5E7A]"></span> Paper B
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedPaperB.source === 'arXiv'
                ? 'bg-amber-100 text-amber-800'
                : selectedPaperB.source === 'Crossref'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-[#E6EDE4] text-[#42643A]'
            }`}>
              {selectedPaperB.source}
            </span>
          </div>

          <select
            value={selectedPaperB.title}
            onChange={(e) => {
              const hit = uniqueChoices.find(c => c.title === e.target.value);
              if (hit) setSelectedPaperB(hit);
            }}
            className="w-full text-xs font-medium bg-white border border-[#E4E8DF] rounded-lg p-2.5 text-[#1C241D] focus:outline-none focus:ring-1 focus:ring-[#42643A]"
          >
            {uniqueChoices.map((c, i) => (
              <option key={i} value={c.title}>
                [{c.source}] ({c.year}) {c.title.slice(0, 75)}...
              </option>
            ))}
          </select>

          <div className="text-xs text-[#586359] space-y-1 bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
            <p className="font-semibold text-[#1C241D] line-clamp-2">{selectedPaperB.title}</p>
            <p className="text-[11px] text-[#849085]">
              {selectedPaperB.authors.slice(0, 3).join(', ')} • {selectedPaperB.year} • {selectedPaperB.citations} citations
            </p>
            <p className="text-[11px] line-clamp-2 italic text-[#586359] mt-1">
              "{selectedPaperB.abstract}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center">
        <button
          onClick={handleRunComparison}
          disabled={isComparing}
          className="px-6 py-2.5 bg-[#42643A] hover:bg-[#35522e] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          {isComparing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Synthesizing Literature Dimensions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Comparative Synthesis
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Area */}
      {comparisonResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Synthesis Summary Card */}
          <div className="bg-[#E6EDE4]/60 border border-[#42643A]/30 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#42643A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Executive Comparative Synthesis
              </span>
              <div className="flex items-center gap-2">
                {onSaveFinding && (
                  <button
                    onClick={handleSaveToInvestigation}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-[#EFEFEA] text-[#1C241D] border border-[#E4E8DF] rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-[#42643A]" /> Log as Finding
                  </button>
                )}
                <button
                  onClick={handleExportMarkdown}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#42643A] hover:bg-[#35522e] text-white rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Dossier (.md)
                </button>
              </div>
            </div>
            <p className="text-xs text-[#1C241D] leading-relaxed font-medium">
              {comparisonResult.comparison.summaryTakeaway}
            </p>
          </div>

          {/* Metrics Delta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#849085]">Publication Gap</span>
              <p className="text-base font-bold text-[#1C241D] mt-0.5">
                {comparisonResult.comparison.metrics.yearDiff} year{comparisonResult.comparison.metrics.yearDiff === 1 ? '' : 's'}
              </p>
              <span className="text-[10px] text-[#586359]">
                {comparisonResult.paperA.year} vs {comparisonResult.paperB.year}
              </span>
            </div>

            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#849085]">Citation Ratio</span>
              <p className="text-base font-bold text-[#1C241D] mt-0.5">
                {comparisonResult.comparison.metrics.citationRatio}:1
              </p>
              <span className="text-[10px] text-[#586359]">
                {comparisonResult.paperA.citations} vs {comparisonResult.paperB.citations} citations
              </span>
            </div>

            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#849085]">Paper A Access</span>
              <p className="text-xs font-semibold text-[#1C241D] mt-1 flex items-center justify-center gap-1">
                {comparisonResult.comparison.metrics.openAccessA ? (
                  <span className="text-[#42643A] flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> Open Access</span>
                ) : (
                  <span className="text-[#849085] flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Subscription</span>
                )}
              </p>
              <span className="text-[10px] text-[#586359]">{comparisonResult.paperA.source}</span>
            </div>

            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#849085]">Paper B Access</span>
              <p className="text-xs font-semibold text-[#1C241D] mt-1 flex items-center justify-center gap-1">
                {comparisonResult.comparison.metrics.openAccessB ? (
                  <span className="text-[#42643A] flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> Open Access</span>
                ) : (
                  <span className="text-[#849085] flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Subscription</span>
                )}
              </p>
              <span className="text-[10px] text-[#586359]">{comparisonResult.paperB.source}</span>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Matrix */}
          <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-[#FAF3E3]/40 border-b border-[#E4E8DF]">
              <h2 className="text-xs font-bold text-[#1C241D] uppercase tracking-wider">
                Dimensional Analysis Matrix
              </h2>
            </div>

            <div className="divide-y divide-[#E4E8DF]">
              {/* Row 1: Research Question */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#42643A]">1. Core Research Question & Scope</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper A:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.researchQuestion.a}</p>
                  </div>
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper B:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.researchQuestion.b}</p>
                  </div>
                </div>
                {comparisonResult.comparison.researchQuestion.synthesis && (
                  <p className="text-[11px] text-[#42643A] font-medium pt-1">
                    ↳ {comparisonResult.comparison.researchQuestion.synthesis}
                  </p>
                )}
              </div>

              {/* Row 2: Methodology */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#42643A]">2. Methodology & Architecture</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper A:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.methodology.a}</p>
                  </div>
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper B:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.methodology.b}</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Dataset / Sample */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#42643A]">3. Dataset & Physical Testbed</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper A:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.datasetSample.a}</p>
                  </div>
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper B:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.datasetSample.b}</p>
                  </div>
                </div>
              </div>

              {/* Row 4: Findings */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#42643A]">4. Empirical Findings & Benchmarks</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper A:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.findings.a}</p>
                  </div>
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper B:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.findings.b}</p>
                  </div>
                </div>
              </div>

              {/* Row 5: Limitations */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#42643A]">5. Limitations & Caveats</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper A:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.limitations.a}</p>
                  </div>
                  <div className="bg-[#FAF3E3]/30 p-3 rounded-lg border border-[#E4E8DF]">
                    <span className="font-semibold text-[#1C241D] block mb-1">Paper B:</span>
                    <p className="text-[#586359]">{comparisonResult.comparison.limitations.b}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement vs Disagreement Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agreement */}
            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#42643A]">
                <CheckCircle2 className="w-4 h-4 text-[#42643A]" />
                Areas of Consensus & Agreement
              </div>
              <ul className="space-y-2">
                {comparisonResult.comparison.areasOfAgreement.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#1C241D] bg-[#E6EDE4]/40 p-2.5 rounded-lg border border-[#E4E8DF]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#42643A] mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disagreement */}
            <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Divergent Assumptions & Trade-offs
              </div>
              <ul className="space-y-2">
                {comparisonResult.comparison.areasOfDisagreement.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#1C241D] bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
