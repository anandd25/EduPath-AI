
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlaskConical,
  BarChart3,
  BookOpen,
  Wrench,
  Sparkles,
  GraduationCap,
  MapPin,
  Wallet,
  BriefcaseBusiness,
  X,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowLeft,
  PanelRightOpen,
  BookMarked,
  ExternalLink,
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
import {
  searchRoadmapResources,
  type ResearchResult,
} from '../lib/research';

type PathwayOption = {
  id: string;
  title: string;
  summary: string;
  subjects: string;
  next: string[];
  duration: string;
  cost: string;
  institutes: string[];
  careers: string[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  tint: string;
};

const OPTIONS: PathwayOption[] = [
  {
    id: 'science',
    title: 'Science',
    summary: 'Explore technology, discovery, health and engineering.',
    subjects: 'Physics, Chemistry, Mathematics, Biology and Computer Science',
    next: ['engineering', 'medicine', 'pure-science', 'computer-science'],
    duration: 'Class 11–12: 2 years; degree depends on specialization',
    cost: 'Varies widely by board, coaching needs and institution; compare local options.',
    institutes: ['Junior colleges with Science stream', 'Government and private higher-secondary schools'],
    careers: ['Engineering', 'Healthcare', 'Research', 'Technology'],
    icon: FlaskConical,
    accent: '#367BA8',
    tint: 'bg-[#C9E6F8] text-[#367BA8]',
  },
  {
    id: 'commerce',
    title: 'Commerce',
    summary: 'Understand business, money, markets and organizations.',
    subjects: 'Accountancy, Business Studies, Economics, Mathematics or Informatics',
    next: ['accounting', 'business-management', 'economics', 'finance'],
    duration: 'Class 11–12: 2 years; degree or professional course after that',
    cost: 'Depends on the college and whether you pursue a degree or professional qualification.',
    institutes: ['Junior colleges with Commerce stream', 'Higher-secondary schools'],
    careers: ['Accounting', 'Business', 'Banking', 'Entrepreneurship'],
    icon: BarChart3,
    accent: '#376E7D',
    tint: 'bg-[#A7D9E6] text-[#376E7D]',
  },
  {
    id: 'humanities',
    title: 'Arts & Humanities',
    summary: 'Explore people, culture, communication, society and law.',
    subjects: 'History, Political Science, Sociology, Psychology, Languages and Geography',
    next: ['law', 'psychology', 'design-media', 'social-sciences'],
    duration: 'Class 11–12: 2 years; further study depends on career goal',
    cost: 'Varies by subject combination, college and later professional training.',
    institutes: ['Junior colleges with Arts/Humanities stream', 'Higher-secondary schools'],
    careers: ['Law', 'Psychology', 'Design and media', 'Public service'],
    icon: BookOpen,
    accent: '#278F89',
    tint: 'bg-[#CDEDE2] text-[#278F89]',
  },
  {
    id: 'diploma',
    title: 'Diploma & Vocational',
    summary: 'Build practical skills through applied and career-focused learning.',
    subjects: 'Polytechnic, ITI trades, applied technology and vocational subjects',
    next: ['polytechnic', 'iti', 'vocational', 'applied-design'],
    duration: 'Often 1–3 years depending on the qualification',
    cost: 'Check the current fee structure, tools/materials costs and eligibility at each institute.',
    institutes: ['Government polytechnics', 'ITI institutes', 'Recognized vocational training centres'],
    careers: ['Technician roles', 'Skilled trades', 'Applied technology', 'Further technical study'],
    icon: Wrench,
    accent: '#278F89',
    tint: 'bg-[#CDEDE2] text-[#278F89]',
  },
];

const NEXT_STEPS: Record<string, Omit<PathwayOption, 'icon' | 'tint' | 'accent'>> = {
  engineering: { id: 'engineering', title: 'Engineering', summary: 'Build and improve systems, products and infrastructure.', subjects: 'Mathematics, Physics, design and computing foundations', next: ['computer-science', 'mechanical', 'civil'], duration: 'Common route: 4-year B.E./B.Tech after Class 12', cost: 'Compare government and private college fees, entrance preparation and living costs.', institutes: ['AICTE-approved engineering colleges', 'State and central government institutes'], careers: ['Software or systems engineer', 'Mechanical engineer', 'Civil engineer'] },
  medicine: { id: 'medicine', title: 'Medicine & Healthcare', summary: 'Explore patient care, diagnostics and health sciences.', subjects: 'Biology, Chemistry and Physics; requirements vary by course', next: ['mbbs', 'allied-health', 'pharmacy'], duration: 'Course length varies by qualification; MBBS is typically 5.5 years in India including internship', cost: 'Check current counselling, tuition, hostel and exam-related costs.', institutes: ['Recognized medical colleges', 'Allied-health and pharmacy institutions'], careers: ['Doctor', 'Allied-health professional', 'Pharmacist'] },
  'pure-science': { id: 'pure-science', title: 'Pure & Applied Science', summary: 'Study scientific questions through experiments and research.', subjects: 'Mathematics, Physics, Chemistry, Biology or related specializations', next: ['bsc', 'research', 'environment'], duration: 'A bachelor’s degree is commonly 3–4 years, depending on programme', cost: 'Compare public universities, lab charges and postgraduate plans.', institutes: ['Universities offering B.Sc. programmes', 'Research-focused institutions'], careers: ['Research assistant', 'Scientist pathway', 'Science educator'] },
  'computer-science': { id: 'computer-science', title: 'Computer Science & IT', summary: 'Learn to create software, digital products and data systems.', subjects: 'Programming, mathematics, algorithms and computing fundamentals', next: ['software', 'data-ai', 'cybersecurity'], duration: 'Diploma, bachelor’s and other routes vary from 1–4+ years', cost: 'Costs vary across degree, diploma and skill-based routes.', institutes: ['Universities and colleges with CS/IT programmes', 'Recognized skill-training providers'], careers: ['Software developer', 'Data analyst', 'Cybersecurity analyst'] },
  accounting: { id: 'accounting', title: 'Accounting & Professional Finance', summary: 'Work with accounts, audit, tax and financial reporting.', subjects: 'Accountancy, business law, economics and quantitative skills', next: ['bcom', 'ca-cma', 'taxation'], duration: 'Degree and professional qualification timelines differ', cost: 'Include exam, registration, coaching and college fees when budgeting.', institutes: ['Commerce colleges', 'Official professional-course providers'], careers: ['Accountant', 'Auditor', 'Tax professional'] },
  'business-management': { id: 'business-management', title: 'Business & Management', summary: 'Learn how teams, operations and organizations work.', subjects: 'Business, economics, communication, analytics and management', next: ['bba', 'entrepreneurship', 'marketing'], duration: 'Bachelor’s programmes commonly take 3–4 years', cost: 'Compare public/private college fees, internships and location costs.', institutes: ['Colleges offering BBA/BMS or related programmes', 'Universities with management studies'], careers: ['Operations', 'Marketing', 'Management', 'Entrepreneurship'] },
  economics: { id: 'economics', title: 'Economics', summary: 'Study choices, markets, policy and how economies work.', subjects: 'Economics, mathematics/statistics and social sciences', next: ['economics-degree', 'policy', 'analytics'], duration: 'Bachelor’s programme commonly takes 3–4 years', cost: 'Check programme fees and whether advanced mathematics is required.', institutes: ['Universities offering economics programmes', 'Liberal arts and social-science colleges'], careers: ['Economic research', 'Policy analysis', 'Business analytics'] },
  finance: { id: 'finance', title: 'Finance & Banking', summary: 'Explore financial planning, markets and risk.', subjects: 'Accountancy, economics, mathematics and business', next: ['bcom', 'finance-degree', 'banking-exams'], duration: 'Degree and certification routes vary', cost: 'Consider course fees and any professional exam fees.', institutes: ['Commerce colleges', 'Universities with finance programmes'], careers: ['Banking', 'Financial analysis', 'Financial planning'] },
  law: { id: 'law', title: 'Law', summary: 'Explore legal systems, rights, policy and advocacy.', subjects: 'Reading, writing, reasoning, civics and current affairs', next: ['integrated-law', 'law-degree'], duration: 'Integrated law after Class 12 is commonly 5 years in India', cost: 'Check entrance requirements, tuition and living costs.', institutes: ['Bar Council-recognized law colleges', 'Universities offering integrated law programmes'], careers: ['Advocacy', 'Legal research', 'Compliance'] },
  psychology: { id: 'psychology', title: 'Psychology', summary: 'Study behaviour, learning, emotions and mental processes.', subjects: 'Psychology, biology, research methods and statistics', next: ['psychology-degree', 'counselling'], duration: 'Degree and any later professional qualification vary by role', cost: 'Include postgraduate study where required for your intended role.', institutes: ['Universities offering psychology', 'Recognized counselling and social-science programmes'], careers: ['Research', 'People and learning roles', 'Further professional psychology training'] },
  'design-media': { id: 'design-media', title: 'Design & Media', summary: 'Create visual communication, digital experiences and stories.', subjects: 'Visual design, communication, creative practice and portfolio work', next: ['design-degree', 'media'], duration: 'Diploma and degree routes commonly take 1–4 years', cost: 'Account for studio materials, equipment and portfolio preparation.', institutes: ['Recognized design colleges', 'Media and communication programmes'], careers: ['Graphic design', 'Animation', 'Media production', 'UX design'] },
  'social-sciences': { id: 'social-sciences', title: 'Social Sciences', summary: 'Understand communities, institutions and social change.', subjects: 'History, sociology, political science, geography and research', next: ['social-science-degree', 'public-service'], duration: 'Bachelor’s programme commonly takes 3–4 years', cost: 'Compare public universities and programme-specific expenses.', institutes: ['Universities offering social-science programmes', 'Liberal arts colleges'], careers: ['Research', 'Public policy', 'Community development'] },
  polytechnic: { id: 'polytechnic', title: 'Polytechnic Diploma', summary: 'Gain applied technical skills in a focused discipline.', subjects: 'Engineering fundamentals, workshop practice and specialization subjects', next: ['diploma-engineering', 'lateral-entry'], duration: 'Often 3 years after Class 10; confirm state rules', cost: 'Government and private institute fees differ; include tools and travel.', institutes: ['State government polytechnics', 'Recognized private polytechnics'], careers: ['Technical roles', 'Further engineering study where eligible'] },
  iti: { id: 'iti', title: 'ITI & Skilled Trades', summary: 'Train for practical work in a specific trade.', subjects: 'Trade theory, workshop practice and safety', next: ['apprenticeship', 'trade-certification'], duration: 'Trade courses often take 6 months–2 years', cost: 'Check current institute fees, tools and apprenticeship terms.', institutes: ['Government ITIs', 'NCVT/SCVT-recognized ITIs'], careers: ['Technician', 'Electrician or other trade roles', 'Apprenticeship'] },
  vocational: { id: 'vocational', title: 'Vocational Courses', summary: 'Develop job-ready skills in an applied field.', subjects: 'Practical training aligned with the chosen occupation', next: ['certificate', 'apprenticeship'], duration: 'Depends on the course and qualification level', cost: 'Verify accreditation, placement claims and total fees before enrolling.', institutes: ['Recognized skill-development centres', 'Approved vocational providers'], careers: ['Entry-level skilled roles', 'Apprenticeship', 'Further training'] },
  'applied-design': { id: 'applied-design', title: 'Applied Design', summary: 'Combine hands-on making with design and production skills.', subjects: 'Design basics, materials, tools and project work', next: ['design-diploma', 'portfolio'], duration: 'Course length varies by provider and specialization', cost: 'Check material, equipment and portfolio costs.', institutes: ['Recognized applied arts and design institutes', 'Vocational training providers'], careers: ['Production design', 'Craft and product work', 'Further design study'] },
};

const titleCase = (id: string) =>
  id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

type RoadmapNodeData = {
  label: string;
  subtitle: string;
  accent: string;
  kind: 'root' | 'pathway' | 'next';
  selected: boolean;
  onSelect: () => void;
};

function RoadmapNode({ data }: NodeProps<Node<RoadmapNodeData>>) {
  const root = data.kind === 'root';
  return (
    <div
      className={`min-w-[190px] rounded-2xl border bg-white shadow-sm transition-all ${
        data.selected ? 'ring-2 ring-[#367BA8]/25 shadow-md' : ''
      }`}
      style={{ borderColor: data.selected ? data.accent : '#DCEBEA' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#A7D9E6] !border-white" />
      <button onClick={data.onSelect} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: data.accent }}
          >
            {root ? <GraduationCap className="h-5 w-5" /> : <BookMarked className="h-5 w-5" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#376E7D]">{data.label}</span>
            <span className="mt-1 block text-xs text-[#5E8085]">{data.subtitle}</span>
          </span>
        </div>
      </button>
      <Handle type="source" position={Position.Bottom} className="!bg-[#A7D9E6] !border-white" />
    </div>
  );
}

const nodeTypes = { roadmap: RoadmapNode };

function RoadmapCanvas() {
  const [selectedId, setSelectedId] = useState('class10');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState('');
  const [notice, setNotice] = useState('');

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const selectedPathway =
    OPTIONS.find(item => item.id === selectedId) ?? NEXT_STEPS[selectedId];

  const selectedTitle =
    selectedId === 'class10'
      ? 'Class 10'
      : selectedPathway?.title ?? titleCase(selectedId);

  const availableNext = selectedId === 'class10'
    ? OPTIONS.map(item => ({ id: item.id, title: item.title }))
    : selectedPathway?.next.map(id => ({
        id,
        title: NEXT_STEPS[id]?.title ?? OPTIONS.find(item => item.id === id)?.title ?? titleCase(id),
      })) ?? [];

  const graph = useMemo(() => {
    const visibleIds = new Set(['class10', ...addedIds]);
    const childrenByParent = new Map<string, string[]>();

    for (const id of addedIds) {
      const option = OPTIONS.find(item => item.id === id) ?? NEXT_STEPS[id];
      if (!option) continue;

      const parentId = addedIds.find(parent => {
        const parentOption = OPTIONS.find(item => item.id === parent) ?? NEXT_STEPS[parent];
        return parentOption?.next.includes(id);
      }) ?? 'class10';

      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId)!.push(id);
    }

    const nodes: Node<RoadmapNodeData>[] = [];
    const edges: Edge[] = [];
    const levels: Record<number, string[]> = { 0: ['class10'], 1: [], 2: [], 3: [] };

    for (const id of addedIds) {
      const parentId = addedIds.find(parent => {
        const parentOption = OPTIONS.find(item => item.id === parent) ?? NEXT_STEPS[parent];
        return parentOption?.next.includes(id);
      }) ?? 'class10';
      const parentDepth = parentId === 'class10' ? 0 : 1;
      const depth = parentDepth + 1;
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(id);
    }

    const nodeIds = ['class10', ...addedIds];
    const depthById: Record<string, number> = { class10: 0 };
    for (const id of addedIds) {
      const parentId = addedIds.find(parent => {
        const parentOption = OPTIONS.find(item => item.id === parent) ?? NEXT_STEPS[parent];
        return parentOption?.next.includes(id);
      }) ?? 'class10';
      depthById[id] = (depthById[parentId] ?? 0) + 1;
    }

    for (const id of nodeIds) {
      const depth = depthById[id] ?? 0;
      const levelIds = nodeIds.filter(candidate => (depthById[candidate] ?? 0) === depth);
      const index = levelIds.indexOf(id);
      const option = OPTIONS.find(item => item.id === id) ?? NEXT_STEPS[id];
      const accent = id === 'class10' ? '#367BA8' : ('accent' in (option ?? {}) ? (option as PathwayOption).accent : '#278F89');

      nodes.push({
        id,
        type: 'roadmap',
        position: { x: index * 260, y: depth * 160 },
        data: {
          label: id === 'class10' ? 'Class 10' : option?.title ?? titleCase(id),
          subtitle: id === 'class10' ? 'Starting milestone' : depth === 1 ? 'Choose a stream' : 'Explore this direction',
          accent,
          kind: id === 'class10' ? 'root' : depth === 1 ? 'pathway' : 'next',
          selected: id === selectedId,
          onSelect: () => {
            setSelectedId(id);
            setDetailsOpen(true);
          },
        },
      });

      if (id !== 'class10') {
        const parentId = addedIds.find(parent => {
          const parentOption = OPTIONS.find(item => item.id === parent) ?? NEXT_STEPS[parent];
          return parentOption?.next.includes(id);
        }) ?? 'class10';
        edges.push({
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          animated: id === selectedId,
          style: { stroke: '#A7D9E6', strokeWidth: 2 },
        });
      }
    }

    return { nodes, edges };
  }, [addedIds, selectedId]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RoadmapNodeData>>(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  React.useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  const addChild = useCallback((id: string) => {
    setAddedIds(current => current.includes(id) ? current : [...current, id]);
    setSelectedId(id);
    setDetailsOpen(true);
    setNotice(`${NEXT_STEPS[id]?.title ?? OPTIONS.find(item => item.id === id)?.title ?? titleCase(id)} added to your roadmap.`);
  }, []);

  const researchSelectedStep = async () => {
    const query = selectedId === 'class10'
      ? 'Education pathways after Class 10 in India'
      : `${selectedTitle} education pathway subjects courses careers India`;

    setResearchLoading(true);
    setResearchError('');
    setResearchResults([]);

    try {
      const results = await searchRoadmapResources(query);
      setResearchResults(results);
      if (results.length === 0) setResearchError('No resources found. Try again later.');
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : 'Unable to load research resources.');
    } finally {
      setResearchLoading(false);
    }
  };

  const currentIcon = selectedPathway && 'icon' in selectedPathway
    ? selectedPathway.icon
    : GraduationCap;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5FAF9] text-[#376E7D]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#DCEBEA] bg-white px-4 sm:px-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            aria-label="Leave roadmap"
            className="rounded-xl p-2 text-[#5E8085] hover:bg-[#F0F7F6]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9E6F8] text-[#367BA8]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold sm:text-base">EduPath AI</h1>
            <p className="text-xs text-[#5E8085]">Interactive roadmap workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => zoomOut()} title="Zoom out" className="rounded-lg p-2 hover:bg-[#F0F7F6]"><ZoomOut className="h-5 w-5" /></button>
          <button onClick={() => zoomIn()} title="Zoom in" className="rounded-lg p-2 hover:bg-[#F0F7F6]"><ZoomIn className="h-5 w-5" /></button>
          <button onClick={() => fitView({ padding: 0.2, duration: 300 })} title="Fit roadmap to screen" className="rounded-lg p-2 hover:bg-[#F0F7F6]"><Maximize className="h-5 w-5" /></button>
          <button onClick={() => { setResearchOpen(false); setDetailsOpen(v => !v); }} title="Toggle details" className="ml-1 flex items-center gap-2 rounded-xl border border-[#DCEBEA] px-3 py-2 text-xs font-semibold hover:bg-[#F0F7F6]">
            <PanelRightOpen className="h-4 w-4" /><span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1">
        <section className="relative min-w-0 flex-1">
          <div className="absolute left-4 top-4 z-10 rounded-xl border border-[#DCEBEA] bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:left-6 sm:top-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#278F89]">Your interactive pathway map</p>
            <h2 className="mt-1 text-sm font-bold text-[#376E7D]">{selectedTitle}</h2>
            <p className="mt-1 text-xs text-[#5E8085]">Drag to pan · Scroll to zoom · Select a node to explore</p>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.25}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#DCEBEA" gap={24} size={1} />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              nodeColor={node => String((node.data as RoadmapNodeData).accent)}
              maskColor="rgba(245,250,249,0.65)"
            />
          </ReactFlow>

          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 sm:bottom-6">
            <button
              onClick={() => { setSelectedId('class10'); setDetailsOpen(true); }}
              className="whitespace-nowrap rounded-full border border-[#DCEBEA] bg-white px-4 py-2.5 text-xs font-semibold text-[#376E7D] shadow-md hover:border-[#367BA8]"
            >
              Back to Class 10
            </button>
          </div>
        </section>

        {detailsOpen && (
          <aside className="absolute inset-y-0 right-0 z-20 flex w-full flex-col overflow-hidden border-l border-[#DCEBEA] bg-white shadow-2xl sm:w-[390px] xl:w-[420px]">
            <div className="flex items-center justify-between border-b border-[#DCEBEA] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CDEDE2] text-[#278F89]">
                  {React.createElement(currentIcon, { className: 'h-5 w-5' })}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#278F89]">Pathway details</p>
                  <h3 className="text-base font-bold">{selectedTitle}</h3>
                </div>
              </div>
              <button onClick={() => setDetailsOpen(false)} aria-label="Close details" className="rounded-lg p-2 hover:bg-[#F0F7F6]"><X className="h-5 w-5" /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="text-sm leading-relaxed text-[#5E8085]">
                {selectedId === 'class10'
                  ? 'Start with a stream or learning route, then select each node to explore the next stage.'
                  : selectedPathway?.summary ?? 'Explore this education or career direction and review the next available options.'}
              </p>

              {selectedPathway && (
                <div className="mt-5 space-y-4">
                  <InfoRow icon={BookOpen} title="Subjects / focus" value={selectedPathway.subjects} />
                  <InfoRow icon={GraduationCap} title="Typical duration" value={selectedPathway.duration} />
                  <InfoRow icon={Wallet} title="Expense planning" value={selectedPathway.cost} />
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#367BA8]" />
                    <div>
                      <p className="text-xs font-bold">Institute types to explore</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#5E8085]">
                        {selectedPathway.institutes.map(name => <li key={name}>{name}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-[#367BA8]" />
                    <div>
                      <p className="text-xs font-bold">Possible future directions</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedPathway.careers.map(career => <span key={career} className="rounded-full bg-[#EAF4F3] px-2.5 py-1 text-[10px]">{career}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-[#DCEBEA] pt-5">
                <h4 className="mb-3 text-xs font-bold">{selectedId === 'class10' ? 'Choose your first route' : 'Explore the next step'}</h4>
                <div className="space-y-2">
                  {availableNext.map(option => {
                    const added = addedIds.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => addChild(option.id)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#DCEBEA] p-3 text-left transition hover:border-[#367BA8] hover:bg-[#F5FAF9]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9E6F8]/70 text-[#367BA8]">
                          {added ? <BookMarked className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </span>
                        <span className="flex-1 text-xs font-semibold">{option.title}</span>
                        <span className="text-[10px] text-[#5E8085]">{added ? 'On roadmap' : 'Add node'}</span>
                      </button>
                    );
                  })}
                  {availableNext.length === 0 && <p className="text-xs text-[#5E8085]">No additional routes are configured for this node yet.</p>}
                </div>
              </div>

              <button
                onClick={() => { setDetailsOpen(false); setResearchOpen(true); }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#367BA8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2E688E]"
              >
                <Search className="h-4 w-4" /> Research this step
              </button>
              {notice && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-[#278F89]"><Sparkles className="h-4 w-4" />{notice}</p>}
            </div>
          </aside>
        )}

        {researchOpen && (
          <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col overflow-hidden border-l border-[#DCEBEA] bg-white shadow-2xl sm:w-[390px] xl:w-[420px]">
            <div className="flex items-center justify-between border-b border-[#DCEBEA] p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#278F89]">Research resources</p>
                <h3 className="mt-1 text-base font-bold">{selectedTitle}</h3>
              </div>
              <button onClick={() => setResearchOpen(false)} aria-label="Close research" className="rounded-lg p-2 hover:bg-[#F0F7F6]"><X className="h-5 w-5" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="text-xs leading-relaxed text-[#5E8085]">Find articles, learning guides, and references related to this pathway.</p>
              <button
                onClick={researchSelectedStep}
                disabled={researchLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#367BA8] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Search className="h-4 w-4" /> {researchLoading ? 'Searching…' : 'Find resources'}
              </button>
              {researchError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{researchError}</p>}
              <div className="mt-4 space-y-3">
                {researchResults.map(result => (
                  <article key={result.url} className="rounded-xl border border-[#DCEBEA] bg-[#FBFDFC] p-4">
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#367BA8] hover:underline">
                      {result.title}
                    </a>
                    <p className="mt-2 text-xs leading-relaxed text-[#5E8085]">{result.content}</p>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#278F89]">
                      Open resource <ExternalLink className="h-3 w-3" />
                    </a>
                  </article>
                ))}
              </div>
              {!researchLoading && !researchError && researchResults.length === 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-[#DCEBEA] p-6 text-center">
                  <Search className="mx-auto h-6 w-6 text-[#A7D9E6]" />
                  <p className="mt-3 text-sm font-semibold">Ready to research</p>
                  <p className="mt-1 text-xs text-[#5E8085]">Run a search to load relevant resources.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#367BA8]" />
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#5E8085]">{value}</p>
      </div>
    </div>
  );
}

export const PathwayDiagram: React.FC = () => (
  <ReactFlowProvider>
    <RoadmapCanvas />
  </ReactFlowProvider>
);

export default PathwayDiagram;
