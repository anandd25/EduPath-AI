import React, { useMemo, useState } from 'react';
import {
  FlaskConical, BarChart3, BookOpen, Wrench, Sparkles, ChevronRight,
  ChevronDown, GraduationCap, MapPin, Wallet, BriefcaseBusiness, X, Plus,
} from 'lucide-react';
import {
  searchRoadmapResources,
  type ResearchResult,
} from '../lib/research';


const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
const [researchLoading, setResearchLoading] = useState(false);
const [researchError, setResearchError] = useState('');


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
    id: 'science', title: 'Science', summary: 'Explore technology, discovery, health and engineering.',
    subjects: 'Physics, Chemistry, Mathematics, Biology and Computer Science',
    next: ['engineering', 'medicine', 'pure-science', 'computer-science'],
    duration: 'Class 11–12: 2 years; degree depends on specialization',
    cost: 'Varies widely by board, coaching needs and institution; compare local options.',
    institutes: ['Junior colleges with Science stream', 'Government and private higher-secondary schools'],
    careers: ['Engineering', 'Healthcare', 'Research', 'Technology'],
    icon: FlaskConical, accent: '#367BA8', tint: 'bg-[#C9E6F8] text-[#367BA8]',
  },
  {
    id: 'commerce', title: 'Commerce', summary: 'Understand business, money, markets and organizations.',
    subjects: 'Accountancy, Business Studies, Economics, Mathematics or Informatics',
    next: ['accounting', 'business-management', 'economics', 'finance'],
    duration: 'Class 11–12: 2 years; degree or professional course after that',
    cost: 'Depends on the college and whether you pursue a degree or professional qualification.',
    institutes: ['Junior colleges with Commerce stream', 'Higher-secondary schools'],
    careers: ['Accounting', 'Business', 'Banking', 'Entrepreneurship'],
    icon: BarChart3, accent: '#376E7D', tint: 'bg-[#A7D9E6] text-[#376E7D]',
  },
  {
    id: 'humanities', title: 'Arts & Humanities', summary: 'Explore people, culture, communication, society and law.',
    subjects: 'History, Political Science, Sociology, Psychology, Languages and Geography',
    next: ['law', 'psychology', 'design-media', 'social-sciences'],
    duration: 'Class 11–12: 2 years; further study depends on career goal',
    cost: 'Varies by subject combination, college and later professional training.',
    institutes: ['Junior colleges with Arts/Humanities stream', 'Higher-secondary schools'],
    careers: ['Law', 'Psychology', 'Design and media', 'Public service'],
    icon: BookOpen, accent: '#278F89', tint: 'bg-[#CDEDE2] text-[#278F89]',
  },
  {
    id: 'diploma', title: 'Diploma & Vocational', summary: 'Build practical skills through applied and career-focused learning.',
    subjects: 'Polytechnic, ITI trades, applied technology and vocational subjects',
    next: ['polytechnic', 'iti', 'vocational', 'applied-design'],
    duration: 'Often 1–3 years depending on the qualification',
    cost: 'Check the current fee structure, tools/materials costs and eligibility at each institute.',
    institutes: ['Government polytechnics', 'ITI institutes', 'Recognized vocational training centres'],
    careers: ['Technician roles', 'Skilled trades', 'Applied technology', 'Further technical study'],
    icon: Wrench, accent: '#278F89', tint: 'bg-[#CDEDE2] text-[#278F89]',
  },
];

const NEXT_STEPS: Record<string, Omit<PathwayOption, 'icon' | 'tint' | 'accent'>> = {
  engineering: { id: 'engineering', title: 'Engineering', summary: 'Build and improve systems, products and infrastructure.', subjects: 'Mathematics, Physics, design and computing foundations', next: ['computer-science', 'mechanical', 'civil'], duration: 'Common route: 4-year B.E./B.Tech after Class 12', cost: 'Compare government and private college fees, entrance preparation and living costs.', institutes: ['AICTE-approved engineering colleges', 'State and central government institutes'], careers: ['Software or systems engineer', 'Mechanical engineer', 'Civil engineer'], },
  medicine: { id: 'medicine', title: 'Medicine & Healthcare', summary: 'Explore patient care, diagnostics and health sciences.', subjects: 'Biology, Chemistry and Physics; requirements vary by course', next: ['mbbs', 'allied-health', 'pharmacy'], duration: 'Course length varies by qualification; MBBS is typically 5.5 years in India including internship', cost: 'Check current counselling, tuition, hostel and exam-related costs.', institutes: ['Recognized medical colleges', 'Allied-health and pharmacy institutions'], careers: ['Doctor', 'Allied-health professional', 'Pharmacist'], },
  'pure-science': { id: 'pure-science', title: 'Pure & Applied Science', summary: 'Study scientific questions through experiments and research.', subjects: 'Mathematics, Physics, Chemistry, Biology or related specializations', next: ['bsc', 'research', 'environment'], duration: 'A bachelor’s degree is commonly 3–4 years, depending on programme', cost: 'Compare public universities, lab charges and postgraduate plans.', institutes: ['Universities offering B.Sc. programmes', 'Research-focused institutions'], careers: ['Research assistant', 'Scientist pathway', 'Science educator'], },
  'computer-science': { id: 'computer-science', title: 'Computer Science & IT', summary: 'Learn to create software, digital products and data systems.', subjects: 'Programming, mathematics, algorithms and computing fundamentals', next: ['software', 'data-ai', 'cybersecurity'], duration: 'Diploma, bachelor’s and other routes vary from 1–4+ years', cost: 'Costs vary across degree, diploma and skill-based routes.', institutes: ['Universities and colleges with CS/IT programmes', 'Recognized skill-training providers'], careers: ['Software developer', 'Data analyst', 'Cybersecurity analyst'], },
  accounting: { id: 'accounting', title: 'Accounting & Professional Finance', summary: 'Work with accounts, audit, tax and financial reporting.', subjects: 'Accountancy, business law, economics and quantitative skills', next: ['bcom', 'ca-cma', 'taxation'], duration: 'Degree and professional qualification timelines differ', cost: 'Include exam, registration, coaching and college fees when budgeting.', institutes: ['Commerce colleges', 'Official professional-course providers'], careers: ['Accountant', 'Auditor', 'Tax professional'], },
  'business-management': { id: 'business-management', title: 'Business & Management', summary: 'Learn how teams, operations and organizations work.', subjects: 'Business, economics, communication, analytics and management', next: ['bba', 'entrepreneurship', 'marketing'], duration: 'Bachelor’s programmes commonly take 3–4 years', cost: 'Compare public/private college fees, internships and location costs.', institutes: ['Colleges offering BBA/BMS or related programmes', 'Universities with management studies'], careers: ['Operations', 'Marketing', 'Management', 'Entrepreneurship'], },
  economics: { id: 'economics', title: 'Economics', summary: 'Study choices, markets, policy and how economies work.', subjects: 'Economics, mathematics/statistics and social sciences', next: ['economics-degree', 'policy', 'analytics'], duration: 'Bachelor’s programme commonly takes 3–4 years', cost: 'Check programme fees and whether advanced mathematics is required.', institutes: ['Universities offering economics programmes', 'Liberal arts and social-science colleges'], careers: ['Economic research', 'Policy analysis', 'Business analytics'], },
  finance: { id: 'finance', title: 'Finance & Banking', summary: 'Explore financial planning, markets and risk.', subjects: 'Accountancy, economics, mathematics and business', next: ['bcom', 'finance-degree', 'banking-exams'], duration: 'Degree and certification routes vary', cost: 'Consider course fees and any professional exam fees.', institutes: ['Commerce colleges', 'Universities with finance programmes'], careers: ['Banking', 'Financial analysis', 'Financial planning'], },
  law: { id: 'law', title: 'Law', summary: 'Explore legal systems, rights, policy and advocacy.', subjects: 'Reading, writing, reasoning, civics and current affairs', next: ['integrated-law', 'law-degree'], duration: 'Integrated law after Class 12 is commonly 5 years in India', cost: 'Check entrance requirements, tuition and living costs.', institutes: ['Bar Council-recognized law colleges', 'Universities offering integrated law programmes'], careers: ['Advocacy', 'Legal research', 'Compliance'], },
  psychology: { id: 'psychology', title: 'Psychology', summary: 'Study behaviour, learning, emotions and mental processes.', subjects: 'Psychology, biology, research methods and statistics', next: ['psychology-degree', 'counselling'], duration: 'Degree and any later professional qualification vary by role', cost: 'Include postgraduate study where required for your intended role.', institutes: ['Universities offering psychology', 'Recognized counselling and social-science programmes'], careers: ['Research', 'People and learning roles', 'Further professional psychology training'], },
  'design-media': { id: 'design-media', title: 'Design & Media', summary: 'Create visual communication, digital experiences and stories.', subjects: 'Visual design, communication, creative practice and portfolio work', next: ['design-degree', 'media'], duration: 'Diploma and degree routes commonly take 1–4 years', cost: 'Account for studio materials, equipment and portfolio preparation.', institutes: ['Recognized design colleges', 'Media and communication programmes'], careers: ['Graphic design', 'Animation', 'Media production', 'UX design'], },
  'social-sciences': { id: 'social-sciences', title: 'Social Sciences', summary: 'Understand communities, institutions and social change.', subjects: 'History, sociology, political science, geography and research', next: ['social-science-degree', 'public-service'], duration: 'Bachelor’s programme commonly takes 3–4 years', cost: 'Compare public universities and programme-specific expenses.', institutes: ['Universities offering social-science programmes', 'Liberal arts colleges'], careers: ['Research', 'Public policy', 'Community development'], },
  polytechnic: { id: 'polytechnic', title: 'Polytechnic Diploma', summary: 'Gain applied technical skills in a focused discipline.', subjects: 'Engineering fundamentals, workshop practice and specialization subjects', next: ['diploma-engineering', 'lateral-entry'], duration: 'Often 3 years after Class 10; confirm state rules', cost: 'Government and private institute fees differ; include tools and travel.', institutes: ['State government polytechnics', 'Recognized private polytechnics'], careers: ['Technical roles', 'Further engineering study where eligible'], },
  iti: { id: 'iti', title: 'ITI & Skilled Trades', summary: 'Train for practical work in a specific trade.', subjects: 'Trade theory, workshop practice and safety', next: ['apprenticeship', 'trade-certification'], duration: 'Trade courses often take 6 months–2 years', cost: 'Check current institute fees, tools and apprenticeship terms.', institutes: ['Government ITIs', 'NCVT/SCVT-recognized ITIs'], careers: ['Technician', 'Electrician or other trade roles', 'Apprenticeship'], },
  vocational: { id: 'vocational', title: 'Vocational Courses', summary: 'Develop job-ready skills in an applied field.', subjects: 'Practical training aligned with the chosen occupation', next: ['certificate', 'apprenticeship'], duration: 'Depends on the course and qualification level', cost: 'Verify accreditation, placement claims and total fees before enrolling.', institutes: ['Recognized skill-development centres', 'Approved vocational providers'], careers: ['Entry-level skilled roles', 'Apprenticeship', 'Further training'], },
  'applied-design': { id: 'applied-design', title: 'Applied Design', summary: 'Combine hands-on making with design and production skills.', subjects: 'Design basics, materials, tools and project work', next: ['design-diploma', 'portfolio'], duration: 'Course length varies by provider and specialization', cost: 'Check material, equipment and portfolio costs.', institutes: ['Recognized applied arts and design institutes', 'Vocational training providers'], careers: ['Production design', 'Craft and product work', 'Further design study'], },
};

const titleCase = (id: string) => id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

type GraphNode = { id: string; title: string; parentId: string | null; depth: number };

export const PathwayDiagram: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([{ id: 'class10', title: 'Class 10', parentId: null, depth: 0 }]);
  const [selectedId, setSelectedId] = useState('class10');
  const [expandedIds, setExpandedIds] = useState<string[]>(['class10']);
  const [notice, setNotice] = useState('');

  const selected = nodes.find(node => node.id === selectedId) ?? nodes[0];
  const children = useMemo(() => nodes.filter(node => node.parentId === selected.id), [nodes, selected.id]);
  const selectedPathway = OPTIONS.find(item => item.id === selected.id) ?? NEXT_STEPS[selected.id];
  const availableNext = selected.id === 'class10'
    ? OPTIONS.map(item => ({ id: item.id, title: item.title }))
    : selectedPathway?.next.map(id => ({ id, title: NEXT_STEPS[id]?.title ?? titleCase(id) })) ?? [];

  const addChild = (id: string, title: string) => {
    setNodes(current => {
      if (current.some(node => node.id === id && node.parentId === selected.id)) return current;
      return [...current, { id, title, parentId: selected.id, depth: selected.depth + 1 }];
    });
    setExpandedIds(current => current.includes(selected.id) ? current : [...current, selected.id]);
    setSelectedId(id);
    setNotice(`${title} added to your pathway.`);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedIds(current => current.includes(nodeId) ? current.filter(id => id !== nodeId) : [...current, nodeId]);
    setSelectedId(nodeId);
  };

  const selectedIcon = selectedPathway && 'icon' in selectedPathway ? selectedPathway.icon : GraduationCap;

  const researchSelectedStep = async () => {
  const query = selected.id === 'class10'
    ? 'Education pathways after Class 10 in India'
    : `${selected.title} education pathway subjects courses careers India`;

  setResearchLoading(true);
  setResearchError('');
  setResearchResults([]);

  try {
    const results = await searchRoadmapResources(query);
    setResearchResults(results);

    if (results.length === 0) {
      setResearchError('No resources found. Try again later.');
    }
  } catch (error) {
    setResearchError(
      error instanceof Error
        ? error.message
        : 'Unable to load research resources.'
    );
  } finally {
    setResearchLoading(false);
  }
};

  return (
    <div className="relative w-full rounded-3xl bg-white border border-[#DCEBEA] p-4 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#DCEBEA] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#367BA8]" />
          <span className="font-bold text-[#376E7D] tracking-wide uppercase text-[11px]">Your interactive pathway map</span>
        </div>
        <span className="text-[#5E8085] text-[11px] hidden sm:inline">Select a node to explore</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] gap-5">
        <section className="min-w-0">
          <button onClick={() => setSelectedId('class10')} className={`w-full flex items-center gap-3 text-left p-4 rounded-2xl border transition ${selected.id === 'class10' ? 'bg-[#C9E6F8]/60 border-[#367BA8]' : 'bg-[#F5FAF9] border-[#DCEBEA] hover:border-[#367BA8]'}`}>
            <span className="w-11 h-11 rounded-xl bg-[#367BA8] text-white flex items-center justify-center font-bold shrink-0">10</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#376E7D]">Class 10</span><span className="block text-xs text-[#5E8085]">Starting milestone</span></span>
            <ChevronRight className="w-4 h-4 text-[#367BA8]" />
          </button>

          <div className="ml-5 pl-4 mt-3 border-l-2 border-dashed border-[#A7D9E6] space-y-2">
            {nodes.filter(node => node.depth === 1).map(node => {
              const option = OPTIONS.find(item => item.id === node.id);
              const Icon = option?.icon ?? GraduationCap;
              const isExpanded = expandedIds.includes(node.id);
              return (
                <div key={node.id}>
                  <div className={`flex items-center gap-2 rounded-xl border p-2 ${selected.id === node.id ? 'border-[#367BA8] bg-[#F5FAF9]' : 'border-[#DCEBEA] bg-white'}`}>
                    <button onClick={() => setSelectedId(node.id)} className="flex items-center gap-2 min-w-0 flex-1 text-left">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${option?.tint ?? 'bg-[#CDEDE2] text-[#278F89]'}`}><Icon className="w-4 h-4" /></span>
                      <span className="text-sm font-semibold text-[#376E7D] truncate">{node.title}</span>
                    </button>
                    <button aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.title}`} onClick={() => toggleExpand(node.id)} className="p-2 rounded-lg hover:bg-[#EAF4F3] text-[#367BA8]"><ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /></button>
                  </div>
                  {isExpanded && <div className="ml-5 pl-3 mt-2 border-l border-dashed border-[#A7D9E6] space-y-2">
                    {nodes.filter(child => child.parentId === node.id).map(child => (
                      <button key={child.id} onClick={() => setSelectedId(child.id)} className={`w-full flex items-center gap-2 text-left p-2.5 rounded-xl border ${selected.id === child.id ? 'border-[#278F89] bg-[#F0FAF7]' : 'border-[#DCEBEA] bg-white hover:border-[#278F89]'}`}>
                        <span className="w-2 h-2 rounded-full bg-[#278F89]" /><span className="text-xs font-semibold text-[#376E7D] flex-1">{child.title}</span><ChevronRight className="w-3.5 h-3.5 text-[#5E8085]" />
                      </button>
                    ))}
                    {nodes.some(child => child.parentId === node.id) && <p className="text-[10px] text-[#5E8085] pl-1">Select a child to view its next steps.</p>}
                  </div>}
                </div>
              );
            })}
            {nodes.filter(node => node.depth === 1).length === 0 && <p className="text-xs text-[#5E8085] py-3">Choose a stream below to begin building your map.</p>}
          </div>
          {selected.depth >= 2 && <div className="mt-4 p-3 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]"><p className="text-xs text-[#5E8085]">Selected path</p><p className="mt-1 text-sm font-semibold text-[#376E7D]">{nodes.filter(node => node.depth <= selected.depth && (node.id === 'class10' || node.id === selected.id || node.parentId === 'class10' || node.parentId === selected.parentId)).map(node => node.title).join('  ›  ')}</p></div>}
        </section>

        <aside className="rounded-2xl border border-[#DCEBEA] bg-[#FBFDFC] p-4 sm:p-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CDEDE2] text-[#278F89] flex items-center justify-center"><selectedIcon className="w-5 h-5" /></div>
              <div><p className="text-[10px] uppercase tracking-wider font-bold text-[#278F89]">Pathway details</p><h3 className="text-lg font-bold text-[#376E7D]">{selected.title}</h3></div>
            </div>
            {selected.id !== 'class10' && <button aria-label="Return to Class 10" onClick={() => setSelectedId('class10')} className="p-1.5 rounded-lg hover:bg-[#EAF4F3] text-[#5E8085]"><X className="w-4 h-4" /></button>}
          </div>
          <p className="text-sm leading-relaxed text-[#5E8085] mt-3">{selected.id === 'class10' ? 'Start with a stream or learning route, then select each node to explore the next stage.' : selectedPathway?.summary}</p>

          {selected.id !== 'class10' && selectedPathway && <>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2.5"><BookOpen className="w-4 h-4 mt-0.5 text-[#367BA8] shrink-0" /><div><p className="text-xs font-bold text-[#376E7D]">Subjects / focus</p><p className="text-xs leading-relaxed text-[#5E8085] mt-1">{selectedPathway.subjects}</p></div></div>
              <div className="flex gap-2.5"><GraduationCap className="w-4 h-4 mt-0.5 text-[#367BA8] shrink-0" /><div><p className="text-xs font-bold text-[#376E7D]">Typical duration</p><p className="text-xs leading-relaxed text-[#5E8085] mt-1">{selectedPathway.duration}</p></div></div>
              <div className="flex gap-2.5"><Wallet className="w-4 h-4 mt-0.5 text-[#367BA8] shrink-0" /><div><p className="text-xs font-bold text-[#376E7D]">Expense planning</p><p className="text-xs leading-relaxed text-[#5E8085] mt-1">{selectedPathway.cost}</p></div></div>
              <div className="flex gap-2.5"><MapPin className="w-4 h-4 mt-0.5 text-[#367BA8] shrink-0" /><div><p className="text-xs font-bold text-[#376E7D]">Institute types to explore</p><ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-[#5E8085]">{selectedPathway.institutes.map(name => <li key={name}>{name}</li>)}</ul></div></div>
              <div className="flex gap-2.5"><BriefcaseBusiness className="w-4 h-4 mt-0.5 text-[#367BA8] shrink-0" /><div><p className="text-xs font-bold text-[#376E7D]">Possible future directions</p><div className="flex flex-wrap gap-1.5 mt-1.5">{selectedPathway.careers.map(career => <span key={career} className="px-2 py-1 rounded-full bg-[#EAF4F3] text-[#376E7D] text-[10px]">{career}</span>)}</div></div></div>
            </div>
          </>}

          <div className="mt-5 pt-4 border-t border-[#DCEBEA]">
            <p className="text-xs font-bold text-[#376E7D] mb-2">{selected.id === 'class10' ? 'Choose your first route' : 'Explore the next step'}</p>
            <div className="space-y-2">
              {availableNext.map(option => {
                const alreadyAdded = nodes.some(node => node.id === option.id && node.parentId === selected.id);
                return <button key={option.id} onClick={() => addChild(option.id, option.title)} className="w-full flex items-center gap-2.5 text-left p-2.5 rounded-xl bg-white border border-[#DCEBEA] hover:border-[#367BA8] hover:bg-[#F5FAF9] transition">
                  <span className="w-7 h-7 rounded-lg bg-[#C9E6F8]/70 text-[#367BA8] flex items-center justify-center shrink-0">{alreadyAdded ? <ChevronRight className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
                  <span className="text-xs font-semibold text-[#376E7D] flex-1">{option.title}</span>
                  <span className="text-[10px] text-[#5E8085]">{alreadyAdded ? 'Added' : 'Add node'}</span>
                </button>;
              })}
              {availableNext.length === 0 && <p className="text-xs text-[#5E8085]">This is a leaf node in the current starter map. We can connect additional routes through the backend graph in the next step.</p>}
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-[#DCEBEA]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-[#376E7D]">
                Research this step
              </h4>
              <button
                type="button"
                onClick={researchSelectedStep}
                disabled={researchLoading}
                className="px-3 py-2 rounded-lg bg-[#367BA8] text-white text-xs font-semibold disabled:opacity-60"
              >
                {researchLoading ? 'Searching…' : 'Find resources'}
              </button>
            </div>

            <p className="text-xs text-[#5E8085] mb-3">
              Find articles, learning guides, and references related to this pathway.
            </p>

            {researchError && (
              <p role="alert" className="text-xs text-red-600 mb-3">
                {researchError}
              </p>
            )}

            <div className="space-y-3">
              {researchResults.map((result) => (
                <article
                  key={result.url}
                  className="p-3 rounded-xl border border-[#DCEBEA] bg-white"
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#367BA8] hover:underline"
                  >
                    {result.title}
                  </a>

                  <p className="mt-1 text-xs text-[#5E8085] leading-relaxed">
                    {result.content}
                  </p>

                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-semibold text-[#278F89]"
                  >
                    Open resource ↗
                  </a>
                </article>
              ))}
            </div>
          </div>

          {notice && <p role="status" className="mt-3 text-[11px] text-[#278F89] flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />{notice}</p>}
        </aside>
      </div>
      <div className="mt-4 pt-3 border-t border-[#DCEBEA] flex items-start gap-2 text-[11px] text-[#5E8085]"><Sparkles className="w-3.5 h-3.5 text-[#278F89] shrink-0 mt-0.5" /><span>Starter pathway content is illustrative, not personalized or a verified fee/institute listing. The next upgrade will connect these nodes to your saved profile and live backend graph.</span></div>
    </div>
  );
};
