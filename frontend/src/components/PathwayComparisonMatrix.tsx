import React from 'react';
import {
  Clock,
  Wallet,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { PathwayRoute } from '../types/pathway';

interface PathwayComparisonMatrixProps {
  routes: PathwayRoute[];
  onSelectRoute: (routeId: string) => void;
  onComparePreferences: (routeA: string, routeB: string) => void;
  selectedRouteId?: string | null;
}

export const PathwayComparisonMatrix: React.FC<PathwayComparisonMatrixProps> = ({
  routes,
  onSelectRoute,
  onComparePreferences,
  selectedRouteId,
}) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="p-8 text-center text-[#5E8085] bg-white rounded-3xl border border-[#DCEBEA]">
        No pathway routes generated yet.
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 text-[#376E7D]">
      {/* Header explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#367BA8] block">
            Comparative Decision Support
          </span>
          <h3 className="font-serif-heading text-2xl font-bold text-[#376E7D]">
            Side-by-Side Pathway Comparison
          </h3>
          <p className="text-xs sm:text-sm text-[#5E8085] mt-1 max-w-2xl">
            Compare complete education routes from Class 10 to career. Review timeline, staged cash flow,
            academic eligibility, and risk trade-offs before committing.
          </p>
        </div>

        {routes.length >= 2 && (
          <button
            onClick={() => onComparePreferences(routes[0].pathway_id, routes[1].pathway_id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#278F89] text-white font-bold text-xs hover:bg-[#1e736e] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Compare Preferences (A vs B)</span>
          </button>
        )}
      </div>

      {/* Grid of Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {routes.map((route, index) => {
          const isSelected = selectedRouteId === route.pathway_id;
          const isBlocked = route.feasibility_status === 'BLOCKED';
          const isConditional = route.feasibility_status === 'CONDITIONAL';

          const tagLetter = String.fromCharCode(65 + index); // 'A', 'B', 'C'

          return (
            <div
              key={route.pathway_id}
              className={`rounded-3xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'border-[#367BA8] ring-2 ring-[#367BA8]/20'
                  : isBlocked
                  ? 'border-red-200'
                  : 'border-[#DCEBEA]'
              }`}
            >
              {/* Card Header */}
              <div
                className={`p-5 sm:p-6 border-b ${
                  isBlocked
                    ? 'bg-red-50/50 border-red-100'
                    : isConditional
                    ? 'bg-amber-50/40 border-amber-100'
                    : 'bg-[#F5FAF9] border-[#DCEBEA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DCEBEA] text-[#367BA8] text-[11px] font-bold tracking-wider">
                    PATHWAY {tagLetter}
                  </span>

                  {/* Status Badge */}
                  {isBlocked ? (
                    <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>BLOCKED</span>
                    </span>
                  ) : isConditional ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>CONDITIONAL</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-[#CDEDE2] text-[#278F89] text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>FEASIBLE</span>
                    </span>
                  )}
                </div>

                <h4 className="font-serif-heading text-lg font-bold text-[#376E7D] leading-snug">
                  {route.route_name}
                </h4>
                <p className="text-xs text-[#5E8085] mt-1.5 leading-relaxed line-clamp-2">
                  {route.summary}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="p-5 sm:p-6 space-y-4 text-xs flex-1">
                {/* Cost & Timeline */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <div>
                    <span className="text-[10px] text-[#5E8085] block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#367BA8]" />
                      <span>Timeline</span>
                    </span>
                    <span className="text-sm font-bold text-[#376E7D]">
                      {Math.round(route.total_duration_months / 12)} Years ({route.total_duration_months}m)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#5E8085] block flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-[#367BA8]" />
                      <span>Total Cost</span>
                    </span>
                    <span className="text-sm font-bold text-[#376E7D]">
                      {formatCurrency(route.total_cost, route.currency)}
                    </span>
                  </div>
                </div>

                {/* Staged Payment Preview */}
                <div>
                  <span className="text-[11px] font-bold text-[#5E8085] uppercase tracking-wider block mb-1.5">
                    Staged Cash Flow ({route.staged_payments.length} Payments)
                  </span>
                  <div className="space-y-1.5">
                    {route.staged_payments.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#DCEBEA] text-[11px]"
                      >
                        <span className="truncate max-w-[55%] text-[#5E8085]">{p.stage_name}</span>
                        <span className="font-bold text-[#376E7D]">
                          {formatCurrency(p.amount, p.currency)}
                        </span>
                      </div>
                    ))}
                    {route.staged_payments.length > 3 && (
                      <span className="text-[10px] text-[#5E8085] block text-center">
                        + {route.staged_payments.length - 3} more stages
                      </span>
                    )}
                  </div>
                </div>

                {/* Entry Requirements */}
                <div>
                  <span className="text-[11px] font-bold text-[#5E8085] uppercase tracking-wider block mb-1">
                    Entry Prerequisites
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.entry_requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F5FAF9] border border-[#DCEBEA] text-[11px] text-[#376E7D]"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Potential Outcomes */}
                <div>
                  <span className="text-[11px] font-bold text-[#5E8085] uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-[#278F89]" />
                    <span>Career & Degree Outcomes</span>
                  </span>
                  <p className="text-[11px] text-[#5E8085] leading-relaxed">
                    {route.potential_outcomes.slice(0, 3).join(', ')}
                  </p>
                </div>

                {/* Fallback Alternative */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900">
                  <span className="font-bold block mb-0.5 text-amber-800">Fallback Plan:</span>
                  <span className="line-clamp-2">{route.fallback_route}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-[#DCEBEA] bg-[#F5FAF9] flex items-center gap-2">
                <button
                  onClick={() => onSelectRoute(route.pathway_id)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#367BA8] text-white'
                      : 'bg-white border border-[#DCEBEA] text-[#376E7D] hover:border-[#367BA8]'
                  }`}
                >
                  <span>{isSelected ? 'Viewing in Roadmap' : 'Explore Route Nodes'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

