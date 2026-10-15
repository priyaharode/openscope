import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  Filter,
  Search,
  Layers,
  Building,
  User,
  Lightbulb,
  BookOpen,
  Info,
  X,
  ExternalLink,
  BookmarkPlus,
  Eye,
  Activity,
  Award,
  Compass
} from 'lucide-react';
import { GraphData, GraphNode, ResearchSource } from '../types';
import { downloadFile } from '../lib/utils';

interface KnowledgeGraphViewProps {
  graphData: GraphData;
  topicTitle: string;
  onSaveSource?: (source: any) => void;
  onExploreNode?: (nodeLabel: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  graphData,
  topicTitle,
  onSaveSource,
  onExploreNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'breadthfirst' | 'circle'>('cose');
  const [nodeSearch, setNodeSearch] = useState('');
  const [colorMode, setColorMode] = useState<'community' | 'type'>('community');
  const [selectedRelation, setSelectedRelation] = useState<string>('all');
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState<number | null>(null);
  const [isolatedNeighborhoodNodeId, setIsolatedNeighborhoodNodeId] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  const [activeTypeFilters, setActiveTypeFilters] = useState<Record<string, boolean>>({
    topic: true,
    person: true,
    organization: true,
    concept: true,
    paper: true,
    source: true
  });

  // Type color mapping
  const nodeTypeColors: Record<string, string> = {
    topic: '#42643A',
    person: '#2E6171',
    organization: '#5F7335',
    concept: '#8C5A32',
    paper: '#694D75',
    source: '#586359'
  };

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Filter elements based on user toggles
    let filteredNodes = graphData.nodes.filter(n => activeTypeFilters[n.type] !== false);

    if (selectedCommunityFilter !== null) {
      filteredNodes = filteredNodes.filter(n => n.communityId === selectedCommunityFilter || n.type === 'topic');
    }

    const validNodeIds = new Set(filteredNodes.map(n => n.id));
    let filteredEdges = graphData.edges.filter(
      e => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );

    if (selectedRelation !== 'all') {
      filteredEdges = filteredEdges.filter(e => e.relationType === selectedRelation);
    }

    const elements: any[] = [
      ...filteredNodes.map(n => {
        const nodeColor = colorMode === 'community'
          ? (n.color || nodeTypeColors[n.type] || '#42643A')
          : (nodeTypeColors[n.type] || '#42643A');

        return {
          data: {
            id: n.id,
            label: n.label,
            type: n.type,
            size: n.size || 24,
            color: nodeColor,
            communityId: n.communityId,
            importance: n.importanceScore || 0.1,
            degree: n.degree || 1,
            raw: n
          }
        };
      }),
      ...filteredEdges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || '',
          relationType: e.relationType || 'relates',
          weight: e.weight || 1
        }
      }))
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(color)',
            'width': 'data(size)',
            'height': 'data(size)',
            'color': '#1C241D',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-size': '10px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-color': '#FBFBF9',
            'text-background-opacity': 0.9,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'border-width': 2,
            'border-color': '#FFFFFF',
            'transition-property': 'background-color, line-color, target-arrow-color, opacity',
            'transition-duration': 0.2
          }
        },
        {
          selector: 'node[type = "topic"]',
          style: {
            'border-width': 3,
            'border-color': '#E6EDE4',
            'font-size': '12px',
            'font-weight': 700
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 'mapData(weight, 1, 5, 1.2, 3)',
            'line-color': '#D0DEC9',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#ABC4A1',
            'arrow-scale': 0.75,
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#849085',
            'text-rotation': 'autorotate',
            'text-background-color': '#FBFBF9',
            'text-background-opacity': 0.8,
            'text-background-padding': '1px'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#1C241D',
            'line-color': '#42643A',
            'target-arrow-color': '#42643A'
          }
        }
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 400,
        padding: 40,
        ...(layoutName === 'cose' ? {
          nodeRepulsion: () => 7000,
          idealEdgeLength: () => 80,
          gravity: 0.25,
          numIter: 350
        } : {})
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      const rawData = node.data('raw');
      setSelectedNode(rawData || null);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setIsolatedNeighborhoodNodeId(null);
        cy.nodes().style({ opacity: 1 });
        cy.edges().style({ opacity: 0.8 });
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData, layoutName, activeTypeFilters, colorMode, selectedRelation, selectedCommunityFilter]);

  // Handle Search Filtering
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (!nodeSearch.trim()) {
      if (!isolatedNeighborhoodNodeId) {
        cy.nodes().style({ opacity: 1 });
        cy.edges().style({ opacity: 0.8 });
      }
      return;
    }

    const query = nodeSearch.toLowerCase();
    cy.nodes().each((node) => {
      const label = node.data('label').toLowerCase();
      if (label.includes(query)) {
        node.style({ opacity: 1 });
        node.connectedEdges().style({ opacity: 0.9 });
      } else {
        node.style({ opacity: 0.15 });
      }
    });
  }, [nodeSearch, isolatedNeighborhoodNodeId]);

  // Isolate 1-hop neighborhood
  const handleToggleIsolateNeighborhood = (nodeId: string) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (isolatedNeighborhoodNodeId === nodeId) {
      // Clear isolation
      setIsolatedNeighborhoodNodeId(null);
      cy.nodes().style({ opacity: 1 });
      cy.edges().style({ opacity: 0.8 });
    } else {
      setIsolatedNeighborhoodNodeId(nodeId);
      const targetNode = cy.getElementById(nodeId);
      if (targetNode.length > 0) {
        const neighborhood = targetNode.closedNeighborhood();
        cy.nodes().style({ opacity: 0.12 });
        cy.edges().style({ opacity: 0.08 });
        neighborhood.nodes().style({ opacity: 1 });
        neighborhood.edges().style({ opacity: 0.9 });
        cy.animate({
          fit: { eles: neighborhood, padding: 60 },
          duration: 350
        });
      }
    }
  };

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 35);
  const handleReset = () => {
    cyRef.current?.reset();
    cyRef.current?.fit(undefined, 35);
  };

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const png64 = cyRef.current.png({ full: true, scale: 2, bg: '#FBFBF9' });
    const a = document.createElement('a');
    a.href = png64;
    a.download = `OpenScope-Graph-${topicTitle.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const toggleTypeFilter = (type: string) => {
    setActiveTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const stats = graphData.stats;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Info & Stats */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E6EDE4] text-[#42643A] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1C241D]">Knowledge Graph & Co-citation Intelligence</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFEFEA] text-[#586359] border border-[#E4E8DF]">
                {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
              </span>
            </div>
            <p className="text-xs text-[#586359] truncate max-w-sm sm:max-w-md">
              Community detection, degree centrality, and citation topologies for: <strong>{topicTitle}</strong>
            </p>
          </div>
        </div>

        {/* Center: Search inside graph */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-[#849085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={nodeSearch}
            onChange={(e) => setNodeSearch(e.target.value)}
            placeholder="Search node or author..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D5DCD0] focus:border-[#42643A] rounded-xl text-[#1C241D] placeholder-[#849085] focus:outline-none"
          />
        </div>

        {/* Right: Layout Switcher, Stats & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Color Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#EFEFEA] p-1 rounded-lg border border-[#E4E8DF]">
            <button
              onClick={() => setColorMode('community')}
              className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                colorMode === 'community'
                  ? 'bg-white text-[#42643A] font-semibold shadow-2xs'
                  : 'text-[#586359] hover:text-[#1C241D]'
              }`}
            >
              Communities
            </button>
            <button
              onClick={() => setColorMode('type')}
              className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                colorMode === 'type'
                  ? 'bg-white text-[#42643A] font-semibold shadow-2xs'
                  : 'text-[#586359] hover:text-[#1C241D]'
              }`}
            >
              Entity Type
            </button>
          </div>

          {/* Layout Selector */}
          <div className="flex items-center gap-1 bg-[#EFEFEA] p-1 rounded-lg border border-[#E4E8DF]">
            {(['cose', 'concentric', 'breadthfirst', 'circle'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayoutName(l)}
                className={`text-[11px] px-2.5 py-0.5 rounded-md capitalize transition-colors ${
                  layoutName === l
                    ? 'bg-[#42643A] text-white font-medium shadow-2xs'
                    : 'text-[#586359] hover:bg-[#E6EDE4]'
                }`}
              >
                {l === 'cose' ? 'Force-Directed' : l}
              </button>
            ))}
          </div>

          {/* Graph Stats Toggle */}
          <button
            onClick={() => setShowStatsModal(!showStatsModal)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              showStatsModal
                ? 'bg-[#42643A] text-white border-[#42643A]'
                : 'bg-white text-[#1C241D] border-[#E4E8DF] hover:bg-[#EFEFEA]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Metrics</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#EFEFEA] p-1 rounded-lg border border-[#E4E8DF]">
            <button
              onClick={handleZoomIn}
              className="p-1 text-[#586359] hover:text-[#1C241D] hover:bg-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-[#586359] hover:text-[#1C241D] hover:bg-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1 text-[#586359] hover:text-[#1C241D] hover:bg-white rounded transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-[#586359] hover:text-[#1C241D] hover:bg-white rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export PNG button */}
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#EFEFEA] text-[#1C241D] text-xs font-medium rounded-lg border border-[#E4E8DF] transition-colors cursor-pointer"
            title="Export as PNG image"
          >
            <Download className="w-3.5 h-3.5 text-[#42643A]" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar & Relation Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FBFBF9] px-4 py-2.5 rounded-xl border border-[#E4E8DF]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#849085] flex items-center gap-1 font-medium text-[11px]">
            <Filter className="w-3 h-3" />
            Filter Nodes:
          </span>
          {Object.entries({
            topic: 'Topic',
            person: 'People',
            organization: 'Organizations',
            concept: 'Concepts',
            paper: 'Papers'
          }).map(([type, label]) => {
            const isActive = activeTypeFilters[type] !== false;
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E6EDE4] text-[#1C241D] border-[#D0DEC9]'
                    : 'bg-white text-[#849085] border-[#E4E8DF] line-through'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: nodeTypeColors[type] || '#42643A' }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Relation Type Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#849085] font-medium">Edge Relation:</span>
          <select
            value={selectedRelation}
            onChange={(e) => setSelectedRelation(e.target.value)}
            className="text-xs bg-white border border-[#E4E8DF] rounded-md px-2 py-1 text-[#1C241D] focus:outline-none focus:ring-1 focus:ring-[#42643A]"
          >
            <option value="all">All Relationships</option>
            <option value="cites">Citations (cites)</option>
            <option value="authored">Authorship (authored)</option>
            <option value="affiliated">Affiliations (affiliated)</option>
            <option value="develops">Development (develops)</option>
            <option value="relates">General Association</option>
          </select>
        </div>
      </div>

      {/* Community Clusters Strip (if communities exist) */}
      {graphData.communities && graphData.communities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-[#FBFBF9] p-3 rounded-xl border border-[#E4E8DF]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#849085] mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#42643A]" />
            Clusters:
          </span>
          <button
            onClick={() => setSelectedCommunityFilter(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              selectedCommunityFilter === null
                ? 'bg-[#42643A] text-white'
                : 'bg-white text-[#586359] border border-[#E4E8DF] hover:bg-[#EFEFEA]'
            }`}
          >
            All Clusters
          </button>
          {graphData.communities.map((comm) => (
            <button
              key={comm.id}
              onClick={() =>
                setSelectedCommunityFilter(selectedCommunityFilter === comm.id ? null : comm.id)
              }
              className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedCommunityFilter === comm.id
                  ? 'bg-[#1C241D] text-white border-[#1C241D]'
                  : 'bg-white text-[#1C241D] border-[#E4E8DF] hover:bg-[#EFEFEA]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: comm.color }} />
              <span>{comm.name}</span>
              <span className="text-[10px] text-[#849085]">({comm.nodeCount})</span>
            </button>
          ))}
        </div>
      )}

      {/* Interactive Graph Canvas & Inspector */}
      <div className="relative w-full h-[620px] bg-[#FBFBF9] rounded-xl border border-[#E4E8DF] shadow-xs overflow-hidden">
        {/* Cytoscape DOM container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Community Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-[#E4E8DF] shadow-xs text-[11px] space-y-1.5 pointer-events-none hidden sm:block max-w-xs">
          <div className="font-semibold text-[#1C241D] pb-1 border-b border-[#E4E8DF] flex items-center justify-between">
            <span>Graph Clusters & Topologies</span>
          </div>
          {graphData.communities?.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-[#586359] truncate">{c.name}</span>
            </div>
          ))}
          <div className="pt-1 text-[10px] text-[#849085] border-t border-[#E4E8DF]">
            Node radius scales with PageRank importance
          </div>
        </div>

        {/* Floating Graph Stats Panel (Metrics toggle) */}
        {showStatsModal && stats && (
          <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-xs rounded-xl border border-[#E4E8DF] shadow-lg p-4 space-y-3 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E8DF] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#42643A] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Graph Topology Metrics
              </span>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-[#849085] hover:text-[#1C241D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#F9FAF7] rounded-lg border border-[#E4E8DF]">
                <span className="text-[10px] text-[#849085] block">Network Density</span>
                <span className="font-bold text-[#1C241D]">{stats.density}</span>
              </div>
              <div className="p-2 bg-[#F9FAF7] rounded-lg border border-[#E4E8DF]">
                <span className="text-[10px] text-[#849085] block">Average Degree</span>
                <span className="font-bold text-[#1C241D]">{stats.avgDegree}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#849085] block mb-1.5">
                Top Central Hubs (PageRank)
              </span>
              <div className="space-y-1 text-xs">
                {stats.topCentralEntities.map((h, idx) => (
                  <div key={h.id} className="flex items-center justify-between p-1.5 rounded bg-[#F9FAF7]">
                    <span className="truncate max-w-[170px] text-[#1C241D] font-medium">
                      {idx + 1}. {h.label}
                    </span>
                    <span className="font-mono text-[10px] text-[#42643A] font-bold">
                      {(h.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-84 bg-white rounded-xl border border-[#E4E8DF] shadow-lg p-4 space-y-3 z-20 animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded text-white font-semibold"
                    style={{ backgroundColor: selectedNode.color || '#42643A' }}
                  >
                    {selectedNode.type}
                  </span>
                  {selectedNode.clusterLabel && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FAF3E3] text-[#8C5A32] border border-[#E4E8DF]">
                      {selectedNode.clusterLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#1C241D] leading-tight">
                  {selectedNode.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#849085] hover:text-[#1C241D] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Centrality & Importance Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF3E3]/30 p-2.5 rounded-lg border border-[#E4E8DF]">
              <div>
                <span className="text-[10px] text-[#849085] block">Importance Score</span>
                <span className="font-bold text-[#42643A]">
                  {selectedNode.importanceScore !== undefined
                    ? `${(selectedNode.importanceScore * 100).toFixed(0)}%`
                    : '85%'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#849085] block">Node Degree</span>
                <span className="font-bold text-[#1C241D]">
                  {selectedNode.degree !== undefined ? selectedNode.degree : 4} connections
                </span>
              </div>
            </div>

            <p className="text-xs text-[#586359] leading-relaxed">
              {selectedNode.metadata?.description ||
                `Extracted ${selectedNode.type} node reflecting structural co-citations across verified scholarly literature.`}
            </p>

            {selectedNode.metadata?.year && (
              <div className="text-xs text-[#849085]">
                Publication Year: <strong className="text-[#1C241D]">{selectedNode.metadata.year}</strong>
              </div>
            )}

            {/* Actions: Isolate Neighborhood + Search Topic */}
            <div className="pt-2 border-t border-[#E4E8DF] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleToggleIsolateNeighborhood(selectedNode.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isolatedNeighborhoodNodeId === selectedNode.id
                    ? 'bg-[#42643A] text-white border-[#42643A]'
                    : 'bg-white hover:bg-[#EFEFEA] text-[#1C241D] border-[#E4E8DF]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isolatedNeighborhoodNodeId === selectedNode.id ? 'Reset Isolation' : 'Isolate Neighbors'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {selectedNode.metadata?.url && (
                  <a
                    href={selectedNode.metadata.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#42643A] hover:text-[#2C3E28] font-medium p-1.5 rounded hover:bg-[#E6EDE4]"
                    title="Open reference"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {onExploreNode && (
                  <button
                    onClick={() => onExploreNode(selectedNode.label)}
                    className="text-xs bg-[#42643A] hover:bg-[#35522e] text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Search Topic
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
