import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Scale,
  ShieldAlert,
  Coins,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Wallet,
  BookMarked,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Loader2,
} from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DecisionNode, PathwayGraphData, PathwayRoute, PreferenceComparisonResponse, ScenarioSimulationResponse } from '../types/pathway';
import { StudentProfileCreate, StudentProfileOut } from '../types/studentProfile';
import { apiService, isValidRoadmapGraph } from '../services/apiService';
import { clientPathwayService } from '../services/clientPathwayService';
import { NodeDetailModal } from './NodeDetailModal';
import { PathwayComparisonMatrix } from './PathwayComparisonMatrix';
import { PreferenceLearningModal } from './PreferenceLearningModal';
import { ScenarioSimulationWidget } from './ScenarioSimulationWidget';
import { AIGenerationModal } from './AIGenerationModal';

// Custom Node for React Flow Diagram
interface CustomNodeData {
  node: DecisionNode;
  selected: boolean;
  onSelect: (node: DecisionNode) => void;
  accent: string;
}

function DecisionNodeComponent({ data }: NodeProps<Node<CustomNodeData>>) {
  const node = data.node;
  const isBlocked = node.feasibility_status === 'BLOCKED' || (node.blocked_requirements && node.blocked_requirements.length > 0);
  const isConditional = node.feasibility_status === 'CONDITIONAL';

  return (
    <div
      onClick={() => data.onSelect(node)}
      className={`w-[270px] rounded-2xl border-2 bg-white shadow-sm transition-all cursor-pointer p-3.5 space-y-2.5 ${
        data.selected ? 'ring-3 ring-[#367BA8]/40 border-[#367BA8] shadow-md' : 'hover:border-[#367BA8]'
      } ${
        isBlocked ? 'border-red-300 bg-red-50/20' : isConditional ? 'border-amber-300 bg-amber-50/10' : 'border-[#DCEBEA]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#367BA8] !border-2 !border-white !-top-1.5"
      />

      {/* Top Tag & Status */}
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <span
          className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-white shrink-0"
          style={{ backgroundColor: data.accent }}
        >
          {node.node_type}
        </span>

        {isBlocked ? (
          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>BLOCKED</span>
          </span>
        ) : isConditional ? (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-1 shrink-0">
            <HelpCircle className="w-2.5 h-2.5" />
            <span>CONDITIONAL</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-[#CDEDE2] text-[#278F89] font-bold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>FEASIBLE</span>
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-xs font-bold text-[#1E3A4C] leading-snug break-words">
          {node.title}
        </h4>
        <p className="text-[11px] text-[#5E8085] leading-relaxed line-clamp-2 mt-1">
          {node.description}
        </p>
      </div>

      {/* Requirement Snippet */}
      {node.min_grade_or_score && (
        <div className="text-[10px] text-[#278F89] bg-[#EDF8F5] px-2 py-1 rounded-md font-medium truncate border border-[#CDEDE2]/60">
          Req: {node.min_grade_or_score}
        </div>
      )}

      {/* Quick Chips */}
      <div className="pt-2 border-t border-[#DCEBEA] flex items-center justify-between text-[10px] text-[#5E8085]">
        <span className="flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-[#367BA8]" />
          <span>{node.duration_estimate_months ? `${node.duration_estimate_months} mos` : 'Flexible'}</span>
        </span>

        <span className="font-bold text-[#1E3A4C] truncate ml-2">
          {node.cost_estimate ? `${node.cost_currency || '₹'} ${node.cost_estimate.toLocaleString('en-IN')}` : 'Stipend / Free'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#367BA8] !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

const nodeTypes = {
  decision: DecisionNodeComponent,
};

interface PathwayDiagramProps {
  isEmbedded?: boolean;
  studentProfile?: StudentProfileOut | StudentProfileCreate | null;
  onBack?: () => void;
}

export function PathwayCanvas({
  isEmbedded = false,
  studentProfile = null,
  onBack,
}: PathwayDiagramProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'matrix'>('diagram');
  const [filterPathwayId, setFilterPathwayId] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<DecisionNode | null>(null);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isAIGeneratingModalOpen, setIsAIGeneratingModalOpen] = useState(false);

  // Baseline fallback profile if not logged in
  const fallbackProfile: StudentProfileCreate = useMemo(
    () => ({
      education_stage: 'class10',
      preferred_name: 'Student',
      country: 'India',
      region: 'Maharashtra',
      curriculum: 'CBSE',
      academic_status: 'currently_studying',
      preferred_language: 'English',
      subjects: [
        { name: 'Mathematics', marks: 80, maximum_marks: 100, result_status: 'completed', favourite: true, challenging: false },
        { name: 'Science', marks: 78, maximum_marks: 100, result_status: 'completed', favourite: true, challenging: false },
      ],
      overall_percentage: 79,
      overall_result_status: 'completed',
      interests: ['technology_coding', 'mathematics_logic'],
      strengths: [{ name: 'logical_problem_solving', rating: 4, rating_status: 'rated' }],
      interest_description: 'I enjoy science, machines, logic, and problem solving.',
      annual_budget: { currency: 'INR', amount: 150000, budget_status: 'estimated' },
      funding_preferences: { interested_in_scholarships: true, willing_to_consider_loans: true },
      preferred_destination: 'india',
      priorities: ['affordability', 'career_opportunities'],
      career_certainty: 'exploring',
    }),
    []
  );

  const activeProfile = studentProfile || fallbackProfile;
  const disciplineTitle = useMemo(() => clientPathwayService.getDisciplineTitle(activeProfile), [activeProfile]);

  // Immediate deterministic baseline ensures roadmap is instantly running
  const baseline = useMemo(() => clientPathwayService.generatePathways(activeProfile), [activeProfile]);

  const [graphData, setGraphData] = useState<PathwayGraphData>(() => baseline.graph);
  const [routes, setRoutes] = useState<PathwayRoute[]>(() => baseline.routes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Load complete pathways from backend with live telemetry
  const loadPathways = useCallback(async () => {
    setIsGenerating(true);
    setGenerationPhase('Groq AI analyzing Class 10 profile & interests...');
    try {
      const res = await apiService.getPathways(activeProfile, { candidateNodeCount: 12 });
      setGenerationPhase('Validating feasibility, cutoffs & cash-flow...');
      if (res.graph && isValidRoadmapGraph(res.graph)) {
        const graph = res.graph as PathwayGraphData;
        setGraphData(graph);
        setRoutes(graph.pathway_routes || (res.pathway_routes as PathwayRoute[]) || []);
      } else {
        console.warn('Backend graph response invalid or contained placeholder copy; using verified client decision engine.');
        const fallback = clientPathwayService.generatePathways(activeProfile);
        setGraphData(fallback.graph);
        setRoutes(fallback.routes);
      }
    } catch (err) {
      console.warn('Using client pathway decision engine:', err);
      const fallback = clientPathwayService.generatePathways(activeProfile);
      setGraphData(fallback.graph);
      setRoutes(fallback.routes);
    } finally {
      setIsGenerating(false);
      setGenerationPhase('');
    }
  }, [activeProfile]);

  useEffect(() => {
    loadPathways();
  }, [loadPathways]);

  // Construct React Flow graph
  const flowGraph = useMemo(() => {
    if (!graphData || !graphData.nodes) {
      return { nodes: [], edges: [] };
    }

    const BANNED_PATTERNS = [
      /decision matrix/i,
      /if the preferred course/i,
      /if the budget is reduced/i,
      /alternative scenarios/i,
      /scenario planning/i,
      /admission guarantee/i,
    ];

    // Guarantee that no deprecated placeholder nodes ever enter the render tree
    const cleanNodes = graphData.nodes.filter(
      (n) => !BANNED_PATTERNS.some((p) => p.test(n.title || '') || p.test(n.description || ''))
    );

    const filteredNodes =
      filterPathwayId === 'all'
        ? cleanNodes
        : cleanNodes.filter(
            (n) => !n.pathway_id || n.pathway_id === filterPathwayId || n.pathway_id === 'root'
          );

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.node_id));

    // 1. Build incoming edge count to locate root nodes
    const incomingEdgeCount = new Map<string, number>();
    for (const n of cleanNodes) {
      incomingEdgeCount.set(n.node_id, 0);
    }
    for (const e of graphData.edges || []) {
      if (incomingEdgeCount.has(e.target_node_id)) {
        incomingEdgeCount.set(e.target_node_id, (incomingEdgeCount.get(e.target_node_id) || 0) + 1);
      }
    }

    // 2. Identify root node (Class 10 gateway)
    const rootNodes = cleanNodes.filter(
      (n) =>
        n.pathway_id === 'root' ||
        n.node_id.includes('root') ||
        n.node_id.includes('class10') ||
        (incomingEdgeCount.get(n.node_id) || 0) === 0
    );
    const rootNodeId = rootNodes[0]?.node_id || cleanNodes[0]?.node_id;
    const nodeMap = new Map(cleanNodes.map((n) => [n.node_id, n]));

    // 3. Build intra-pathway or from-root edges for safe vertical depth (ignoring cross-pathway fallback edges)
    const intraOutgoingEdges = new Map<string, string[]>();
    for (const n of cleanNodes) {
      intraOutgoingEdges.set(n.node_id, []);
    }
    for (const e of graphData.edges || []) {
      const srcNode = nodeMap.get(e.source_node_id);
      const tgtNode = nodeMap.get(e.target_node_id);
      const isFromRoot = e.source_node_id === rootNodeId || (srcNode && srcNode.pathway_id === 'root');
      const isSamePathway = srcNode && tgtNode && srcNode.pathway_id === tgtNode.pathway_id;

      if (isFromRoot || isSamePathway) {
        if (intraOutgoingEdges.has(e.source_node_id)) {
          intraOutgoingEdges.get(e.source_node_id)!.push(e.target_node_id);
        }
      }
    }

    // 4. Build a map of route sequence positions: routeId -> Map<nodeId, sequenceIndex>
    const routeNodeSequence = new Map<string, number>();
    if (graphData.pathway_routes && Array.isArray(graphData.pathway_routes)) {
      for (const r of graphData.pathway_routes) {
        if (Array.isArray(r.node_ids)) {
          const hasRoot = r.node_ids.includes(rootNodeId);
          r.node_ids.forEach((id, idx) => {
            if (id === rootNodeId) return;
            const stageIndex = hasRoot ? idx : idx + 1;
            if (!routeNodeSequence.has(id)) {
              routeNodeSequence.set(id, stageIndex);
            }
          });
        }
      }
    }

    // 5. Calculate cycle-safe topological depth using BFS from root
    const nodeDepth = new Map<string, number>();
    if (rootNodeId) {
      nodeDepth.set(rootNodeId, 0);
      const queue: string[] = [rootNodeId];
      const visited = new Set<string>([rootNodeId]);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currDepth = nodeDepth.get(curr) || 0;
        const children = intraOutgoingEdges.get(curr) || [];
        for (const child of children) {
          if (!visited.has(child)) {
            visited.add(child);
            nodeDepth.set(child, currDepth + 1);
            queue.push(child);
          }
        }
      }
    }

    // 5. Column Mapping
    const isFiltered = filterPathwayId !== 'all';
    const pathCols: Record<string, number> = {
      path_a_entrance: 0,
      path_b_diploma: 1,
      path_c_vocational: 2,
    };

    let nextCol = 3;
    cleanNodes.forEach((n) => {
      const pId = n.pathway_id || '';
      if (pId && pId !== 'root' && pathCols[pId] === undefined) {
        const lower = pId.toLowerCase();
        if (lower.includes('a') || lower.includes('entrance') || lower.includes('degree')) pathCols[pId] = 0;
        else if (lower.includes('b') || lower.includes('diploma')) pathCols[pId] = 1;
        else if (lower.includes('c') || lower.includes('vocational') || lower.includes('trade')) pathCols[pId] = 2;
        else {
          pathCols[pId] = nextCol++;
        }
      }
    });

    // Spacious layout constants: 270px width + 90px gap = 360px col, 200px height + 80px gap = 280px row
    const COL_WIDTH = 360;
    const ROW_HEIGHT = 280;
    const LEFT_MARGIN = 40;
    const TOP_MARGIN = 40;

    const totalCols = isFiltered ? 1 : Math.max(3, nextCol);
    const rootX = isFiltered ? LEFT_MARGIN : LEFT_MARGIN + ((totalCols - 1) * COL_WIDTH) / 2;
    const rootY = TOP_MARGIN;

    // Track assigned rows per column to eliminate stacking
    const colUsedRows = new Map<number, Set<number>>();
    for (let c = 0; c <= totalCols + 2; c++) {
      colUsedRows.set(c, new Set<number>());
    }

    // Sort nodes deterministically: Root first, then by pathway column and chronological depth
    const sortedFilteredNodes = [...filteredNodes].sort((a, b) => {
      const aIsRoot = a.pathway_id === 'root' || a.node_id === rootNodeId;
      const bIsRoot = b.pathway_id === 'root' || b.node_id === rootNodeId;
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;

      const colA = isFiltered ? 0 : (pathCols[a.pathway_id || ''] ?? 1);
      const colB = isFiltered ? 0 : (pathCols[b.pathway_id || ''] ?? 1);
      if (colA !== colB) return colA - colB;

      const seqA = routeNodeSequence.get(a.node_id) ?? (nodeDepth.get(a.node_id) ?? 99);
      const seqB = routeNodeSequence.get(b.node_id) ?? (nodeDepth.get(b.node_id) ?? 99);
      if (seqA !== seqB) return seqA - seqB;

      return a.node_id.localeCompare(b.node_id);
    });

    const flowNodes: Node<CustomNodeData>[] = [];
    const occupiedCoordinates = new Set<string>();

    for (const n of sortedFilteredNodes) {
      const isRoot = n.pathway_id === 'root' || n.node_id === rootNodeId;
      const pId = n.pathway_id || 'root';

      let posX: number;
      let posY: number;

      if (isRoot) {
        posX = rootX;
        posY = rootY;
      } else {
        const col = isFiltered ? 0 : (pathCols[pId] ?? 1);

        // Calculate sequence-based row
        let targetRow = routeNodeSequence.get(n.node_id) ?? nodeDepth.get(n.node_id) ?? 1;
        if (targetRow <= 0) targetRow = 1;

        // Collision avoidance: if this row in this column is already used, increment row
        const usedRows = colUsedRows.get(col) || new Set<number>();
        while (usedRows.has(targetRow)) {
          targetRow += 1;
        }
        usedRows.add(targetRow);
        colUsedRows.set(col, usedRows);

        posX = LEFT_MARGIN + col * COL_WIDTH;
        posY = TOP_MARGIN + targetRow * ROW_HEIGHT;
      }

      // Safety check: ensure no two nodes share the same exact coordinate
      while (occupiedCoordinates.has(`${posX},${posY}`)) {
        posY += ROW_HEIGHT;
      }
      occupiedCoordinates.add(`${posX},${posY}`);

      const accent =
        pId === 'path_a_entrance' || pId.includes('a')
          ? '#367BA8'
          : pId === 'path_b_diploma' || pId.includes('b')
          ? '#278F89'
          : pId === 'path_c_vocational' || pId.includes('c')
          ? '#D97706'
          : '#376E7D';

      flowNodes.push({
        id: n.node_id,
        type: 'decision',
        position: { x: posX, y: posY },
        data: {
          node: n,
          selected: selectedNode?.node_id === n.node_id,
          onSelect: (clickedNode) => setSelectedNode(clickedNode),
          accent,
        },
      });
    }

    const flowEdges: Edge[] = (graphData.edges || [])
      .filter((e) => filteredNodeIds.has(e.source_node_id) && filteredNodeIds.has(e.target_node_id))
      .map((e) => ({
        id: e.edge_id,
        source: e.source_node_id,
        target: e.target_node_id,
        type: 'smoothstep',
        animated: e.edge_type === 'conditional',
        style: {
          stroke: e.edge_type === 'conditional' ? '#D97706' : e.edge_type === 'alternative' ? '#278F89' : '#367BA8',
          strokeWidth: 2,
        },
      }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [graphData, filterPathwayId, selectedNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowGraph.edges);

  useEffect(() => {
    setNodes(flowGraph.nodes);
    setEdges(flowGraph.edges);
  }, [flowGraph, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 250 });
    }, 100);
    return () => clearTimeout(timer);
  }, [graphData, filterPathwayId, fitView]);

  // Handle Preference Learning Result
  const handlePreferencesUpdated = (result: PreferenceComparisonResponse) => {
    if (result.ranked_pathways) {
      setRoutes(result.ranked_pathways);
    }
  };

  // Handle Scenario Simulation Result
  const handleSimulationApplied = (result: ScenarioSimulationResponse) => {
    if (result.updated_routes) {
      setRoutes(result.updated_routes);
    }
    if (result.graph) {
      setGraphData(result.graph);
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#F9F7F5] text-[#141413] ${
        isEmbedded ? 'w-full h-[620px] rounded-3xl border border-[#EAE5E0] overflow-hidden relative shadow-xs' : 'fixed inset-0 z-50'
      }`}
    >
      {/* Top Workspace Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#EAE5E0] bg-white px-4 sm:px-6 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-2 text-[#6E6762] hover:text-[#141413] hover:bg-[#F9F7F5] rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5F0] text-[#FF671B] border border-[#FFD9C7] shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#141413]">EduPath Decision Engine</h1>
            <p className="text-xs text-[#6E6762] hidden sm:block">
              Evidence-Backed Multi-Pathway Planning &amp; Simulation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#F9F7F5] p-1 rounded-xl border border-[#EAE5E0] text-xs font-semibold">
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'diagram' ? 'bg-white shadow-2xs text-[#FF671B] font-bold' : 'text-[#6E6762]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Roadmap Graph</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'matrix' ? 'bg-white shadow-2xs text-[#FF671B] font-bold' : 'text-[#6E6762]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Routes</span>
            </button>
          </div>

          {/* Groq AI Synthesize Trigger */}
          <button
            disabled={isGenerating}
            onClick={() => setIsAIGeneratingModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all shadow-2xs ${
              isGenerating
                ? 'border-purple-400 bg-purple-100 text-purple-800 animate-pulse cursor-wait'
                : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer'
            }`}
            title="Synthesize personalized roadmap with Groq AI"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                <span className="hidden lg:inline">Groq Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span className="hidden lg:inline">Groq AI Synthesize</span>
              </>
            )}
          </button>

          {/* Preference Learning Trigger */}
          <button
            onClick={() => setIsPreferenceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A7D9E6] bg-[#C9E6F8]/60 text-[#367BA8] hover:bg-[#C9E6F8] font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            title="Teach preferences & update rankings"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Teach Preferences</span>
          </button>

          {/* Scenario Simulator Trigger */}
          <button
            onClick={() => setShowSimulator((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer shadow-2xs ${
              showSimulator
                ? 'bg-[#376E7D] text-white border-[#376E7D]'
                : 'border-[#DCEBEA] bg-white text-[#376E7D] hover:bg-[#F5FAF9]'
            }`}
            title="Test what-if simulation"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden md:inline">What-If Simulator</span>
          </button>
        </div>
      </header>

      {/* Profile Context Banner */}
      <div className="bg-[#FAF8F5] border-b border-[#EAE5E0] px-4 py-2 flex items-center justify-between text-xs text-[#141413] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#141413] bg-white px-2.5 py-1 rounded-full border border-[#EAE5E0] shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#FF671B]" />
            AI Tailored for: <span className="text-[#FF671B]">{activeProfile.preferred_name || 'Student'}</span>
          </span>
          <span className="hidden sm:inline-block text-[#8C827A]">·</span>
          <span className="text-[#6E6762] truncate font-medium">
            Focus: <strong className="text-[#141413]">{disciplineTitle}</strong>
          </span>
          <span className="hidden sm:inline-block text-[#8C827A]">·</span>
          <span className="text-[#6E6762] shrink-0">
            Class 10: <strong className="text-[#0D9488]">{activeProfile.overall_percentage || 80}%</strong>
          </span>
          <span className="hidden md:inline-block text-[#8C827A]">·</span>
          <span className="text-[#6E6762] shrink-0 hidden md:inline">
            Budget: <strong className="text-[#141413]">₹{activeProfile.annual_budget?.amount?.toLocaleString('en-IN') || '1,50,000'}/yr</strong>
          </span>
        </div>
        <button
          disabled={isGenerating}
          onClick={() => setIsAIGeneratingModalOpen(true)}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 ml-2 transition-colors ${
            isGenerating
              ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse cursor-wait'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
              <span>Generating with Groq...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Regenerate with Groq</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Main Body */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Left / Center View: Graph Canvas OR Comparison Matrix */}
        <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
          {viewMode === 'diagram' ? (
            <>
              {/* Filter Sub-bar */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 sm:p-2 rounded-2xl border border-[#DCEBEA] shadow-xs text-xs max-w-[95vw] overflow-x-auto">
                <span className="text-[#5E8085] flex items-center gap-1 pl-1 font-semibold shrink-0">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                <button
                  onClick={() => setFilterPathwayId('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    filterPathwayId === 'all' ? 'bg-[#367BA8] text-white font-bold' : 'hover:bg-[#F5FAF9] text-[#5E8085]'
                  }`}
                >
                  All Routes
                </button>
                <button
                  onClick={() => setFilterPathwayId('path_a_entrance')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterPathwayId === 'path_a_entrance' ? 'bg-[#367BA8] text-white font-bold' : 'hover:bg-[#F5FAF9] text-[#5E8085]'
                  }`}
                >
                  Path A (Degree)
                </button>
                <button
                  onClick={() => setFilterPathwayId('path_b_diploma')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterPathwayId === 'path_b_diploma' ? 'bg-[#278F89] text-white font-bold' : 'hover:bg-[#F5FAF9] text-[#5E8085]'
                  }`}
                >
                  Path B (Diploma)
                </button>
                <button
                  onClick={() => setFilterPathwayId('path_c_vocational')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterPathwayId === 'path_c_vocational' ? 'bg-[#D97706] text-white font-bold' : 'hover:bg-[#F5FAF9] text-[#5E8085]'
                  }`}
                >
                  Path C (Vocational)
                </button>
              </div>

              {/* Live Groq Generation Floating Indicator */}
              {isGenerating && (
                <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border-2 border-purple-400 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Groq AI Engine
                      </span>
                      <span className="text-xs font-bold text-[#1E3A4C]">Synthesizing Fresh Pathways...</span>
                    </div>
                    <p className="text-[11px] text-[#5E8085] mt-0.5 truncate">{generationPhase || 'Generating tailored milestones...'}</p>
                  </div>
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin ml-2 shrink-0" />
                </div>
              )}

              {/* Floating Instructions */}
              <div className="absolute bottom-4 left-4 z-10 hidden sm:block bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#DCEBEA] shadow-xs text-[11px] text-[#5E8085]">
                Click any milestone node to open complete decision details, requirements & cash flow.
              </div>

              {/* Canvas: Never left blank */}
              {nodes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F5FAF9] text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500/20 via-[#367BA8]/20 to-[#278F89]/20 flex items-center justify-center animate-pulse border-2 border-purple-300">
                      <Sparkles className="w-10 h-10 text-purple-600 animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      AI
                    </div>
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-bold text-[#1E3A4C]">
                      Groq AI is Synthesizing Your Roadmap
                    </h3>
                    <p className="text-xs text-[#5E8085] leading-relaxed">
                      Customizing Path A (Degree), Path B (Diploma), and Path C (Vocational) tailored to{' '}
                      <span className="font-semibold text-[#367BA8]">{activeProfile.preferred_name || 'your'}</span> profile...
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                    <div className="p-3.5 rounded-2xl bg-white border-2 border-purple-200 shadow-sm animate-pulse space-y-2">
                      <div className="h-4 bg-purple-100 rounded w-2/3" />
                      <div className="h-3 bg-purple-50 rounded w-full" />
                      <div className="h-3 bg-purple-50 rounded w-4/5" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border-2 border-teal-200 shadow-sm animate-pulse delay-100 space-y-2">
                      <div className="h-4 bg-teal-100 rounded w-2/3" />
                      <div className="h-3 bg-teal-50 rounded w-full" />
                      <div className="h-3 bg-teal-50 rounded w-4/5" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm animate-pulse delay-200 space-y-2">
                      <div className="h-4 bg-amber-100 rounded w-2/3" />
                      <div className="h-3 bg-amber-50 rounded w-full" />
                      <div className="h-3 bg-amber-50 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>{generationPhase || 'Synthesizing with Groq LPU engine...'}</span>
                  </div>
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.2}
                  maxZoom={1.8}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#DCEBEA" gap={24} size={1} />
                  <Controls position="bottom-left" showInteractive={false} />
                  <MiniMap
                    position="bottom-right"
                    pannable
                    zoomable
                    nodeColor={(n) => String((n.data as CustomNodeData).accent)}
                    maskColor="rgba(245,250,249,0.7)"
                  />
                </ReactFlow>
              )}
            </>
          ) : (
            /* Comparison Matrix View */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-6xl mx-auto">
                <PathwayComparisonMatrix
                  routes={routes}
                  onSelectRoute={(id) => {
                    setFilterPathwayId(id);
                    setViewMode('diagram');
                  }}
                  onComparePreferences={(a, b) => {
                    setIsPreferenceModalOpen(true);
                  }}
                  selectedRouteId={filterPathwayId}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Drawer: What-If Scenario Simulator */}
        {showSimulator && (
          <aside className="w-full sm:w-[380px] lg:w-[420px] border-l border-[#DCEBEA] bg-white overflow-y-auto p-5 z-20 shadow-xl animate-in slide-in-from-right duration-200">
            <ScenarioSimulationWidget
              studentProfile={activeProfile}
              onSimulationApplied={handleSimulationApplied}
              onResetBaseline={loadPathways}
            />
          </aside>
        )}
      </div>

      {/* Rich Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onExploreAlternative={(altName) => {
          setSelectedNode(null);
          setViewMode('matrix');
        }}
      />

      {/* Pairwise Preference Learning Modal */}
      <PreferenceLearningModal
        isOpen={isPreferenceModalOpen}
        onClose={() => setIsPreferenceModalOpen(false)}
        routes={routes}
        studentProfile={activeProfile}
        onPreferencesUpdated={handlePreferencesUpdated}
      />

      {/* Groq AI Live Telemetry Modal */}
      <AIGenerationModal
        isOpen={isAIGeneratingModalOpen}
        onClose={() => setIsAIGeneratingModalOpen(false)}
        isGenerating={isGenerating}
        onTriggerGenerate={loadPathways}
        studentProfile={activeProfile}
        disciplineTitle={disciplineTitle}
      />
    </div>
  );
}

export const PathwayDiagram: React.FC<PathwayDiagramProps> = (props) => (
  <ReactFlowProvider>
    <PathwayCanvas {...props} />
  </ReactFlowProvider>
);

export default PathwayDiagram;
