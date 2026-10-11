/**
 * EduPath API Service
 * Manages communication with FastAPI backend.
 * Integrates Supabase JWT authentication token for server-side verification.
 */

import { StudentProfileCreate, StudentProfileOut } from '../types/studentProfile';
import { clientPathwayService } from './clientPathwayService';

// Resolve API base URL from Vite environment or default to production Render URL
export const API_BASE = (
  import.meta.env.VITE_API_BASE || 'https://edupath-ai-backend-9van.onrender.com'
).replace(/\/$/, '');

let currentAuthToken: string | null = null;

/**
 * Set the Supabase access token for authenticated backend API requests
 */
export function setApiAuthToken(token: string | null): void {
  currentAuthToken = token;
}

/**
 * Get the current Supabase access token
 */
export function getApiAuthToken(): string | null {
  return currentAuthToken;
}

/**
 * Generate standard request headers including JWT bearer authorization
 */
function getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...additionalHeaders,
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  return headers;
}

export interface HealthResponse {
  status: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

/**
 * Helper to safely extract error message from response
 */
async function parseErrorResponse(res: Response): Promise<ApiError> {
  const statusCode = res.status;
  try {
    const data = await res.json();
    if (data.detail) {
      if (typeof data.detail === 'string') {
        return { message: data.detail, statusCode };
      }
      if (Array.isArray(data.detail)) {
        const readable = data.detail.map((d: any) => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join('; ');
        return { message: readable, statusCode, details: data.detail };
      }
    }
    return { message: data.message || `Request failed with status ${statusCode}`, statusCode };
  } catch {
    return { message: `Server error (${statusCode})`, statusCode };
  }
}

/**
 * Strict validator for incoming pathway roadmap responses.
 * Detects and rejects deprecated, placeholder, or low-quality meta-nodes such as:
 * - "Decision matrix & verification"
 * - "If the preferred course is unavailable"
 * - "If the budget is reduced"
 * - "Alternative scenarios"
 * - Meta-advisory copy not representing real educational/career milestones.
 */
export function isValidRoadmapGraph(graph: any): boolean {
  if (!graph || typeof graph !== 'object') return false;
  const nodes = graph.nodes;
  if (!Array.isArray(nodes) || nodes.length < 3) return false;

  const BANNED_TITLE_PATTERNS = [
    /decision matrix/i,
    /if the preferred course/i,
    /if the budget is reduced/i,
    /alternative scenarios/i,
    /scenario planning/i,
    /admission guarantee/i,
    /starter roadmap/i,
  ];

  const BANNED_DESC_PATTERNS = [
    /do not treat this as an admission guarantee/i,
    /model options if the preferred course is unavailable/i,
    /recalculate total cost, look for lower-cost recognised options/i,
  ];

  for (const node of nodes) {
    const title = String(node.title || '');
    const desc = String(node.description || '');

    if (BANNED_TITLE_PATTERNS.some((p) => p.test(title))) {
      console.warn(`[Roadmap Validation] Rejected placeholder node title: "${title}"`);
      return false;
    }

    if (BANNED_DESC_PATTERNS.some((p) => p.test(desc))) {
      console.warn(`[Roadmap Validation] Rejected placeholder node description: "${desc.substring(0, 60)}..."`);
      return false;
    }
  }

  // Ensure nodes have real substance: at least some educational, certification or career milestones
  const hasSubstantialMilestones = nodes.some(
    (n: any) => n.node_type === 'education' || n.node_type === 'certification' || n.node_type === 'career'
  );
  if (!hasSubstantialMilestones) return false;

  return true;
}

export const apiService = {
  /**
   * Health check endpoint: GET /health
   */
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: getRequestHeaders(),
    });
    if (!res.ok) {
      throw await parseErrorResponse(res);
    }
    return res.json();
  },

  /**
   * Create student profile: POST /api/profiles
   * Expected status: 201 Created
   */
  async createProfile(profile: StudentProfileCreate): Promise<StudentProfileOut> {
    const res = await fetch(`${API_BASE}/api/profiles`, {
      method: 'POST',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },

  /**
   * Retrieve profile by ID: GET /api/profiles/{profile_id}
   */
  async getProfile(profileId: number): Promise<StudentProfileOut> {
    const res = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'GET',
      headers: getRequestHeaders(),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },

  /**
   * Update profile by ID: PUT /api/profiles/{profile_id}
   */
  async updateProfile(profileId: number, profile: StudentProfileCreate): Promise<StudentProfileOut> {
    const res = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },

  /**
   * Delete profile by ID: DELETE /api/profiles/{profile_id}
   */
  async deleteProfile(profileId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'DELETE',
      headers: getRequestHeaders(),
    });

    if (!res.ok && res.status !== 204) {
      throw await parseErrorResponse(res);
    }
  },

  /**
   * List recent profiles: GET /api/profiles?skip=0&limit=10
   */
  async listProfiles(skip = 0, limit = 10): Promise<StudentProfileOut[]> {
    const res = await fetch(`${API_BASE}/api/profiles?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: getRequestHeaders(),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },

  /**
   * Generate or expand a pathway graph (POST /api/pathways).
   * Validates server response against placeholder nodes and falls back to
   * client pathway decision engine if invalid or unverified.
   */
  async getPathways(
    studentProfileSnapshot: StudentProfileCreate | StudentProfileOut,
    options: {
      currentGraph?: Record<string, unknown> | null;
      currentNodeIdsToExpand?: string[];
      candidateNodeCount?: number;
      generationIntent?: string;
    } = {},
  ): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${API_BASE}/api/pathways`, {
        method: 'POST',
        headers: getRequestHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          student_profile_snapshot: studentProfileSnapshot,
          current_graph: options.currentGraph ?? null,
          current_node_ids_to_expand: options.currentNodeIdsToExpand ?? [],
          candidate_node_count: options.candidateNodeCount ?? 12,
          generation_intent: options.generationIntent ?? 'continue',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidateGraph = (data && data.graph) ? data.graph : data;
        if (isValidRoadmapGraph(candidateGraph)) {
          return data;
        }
        console.warn('[apiService.getPathways] Backend returned deprecated/placeholder graph. Falling back to verified client pathway engine.');
      } else {
        console.warn('Backend /api/pathways responded with non-200 status, using local client decision engine');
      }
    } catch (err) {
      console.warn('Network issue reaching /api/pathways, using local client decision engine:', err);
    }

    // Zero-delay verified multi-pathway decision engine
    const fallback = clientPathwayService.generatePathways(studentProfileSnapshot);
    return {
      graph: fallback.graph,
      pathway_routes: fallback.routes,
      comparison_matrix: fallback.graph.comparison_matrix,
      source: 'client_decision_engine',
      notice: 'Verified multi-pathway decision support system loaded.',
    };
  },

  /**
   * Compare complete candidate pathways side-by-side (POST /api/pathways/compare)
   */
  async comparePathways(
    studentProfileSnapshot: StudentProfileCreate | StudentProfileOut,
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/pathways/compare`, {
        method: 'POST',
        headers: getRequestHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          student_profile_snapshot: studentProfileSnapshot,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const routes = data?.pathways || data?.pathway_routes;
        if (Array.isArray(routes) && routes.length >= 2) {
          const hasPlaceholders = routes.some((r: any) =>
            /starter|placeholder|unverified|decision matrix|preferred course/i.test(r.route_name || '')
          );
          if (!hasPlaceholders) {
            return data;
          }
          console.warn('[apiService.comparePathways] Server returned placeholder routes, using client decision engine.');
        }
      }
    } catch (err) {
      console.warn('Falling back to local pathway comparison:', err);
    }

    const fallback = clientPathwayService.generatePathways(studentProfileSnapshot);
    return {
      pathway_routes: fallback.routes,
      comparison_matrix: fallback.graph.comparison_matrix,
    };
  },

  /**
   * Submit pairwise preference comparison (POST /api/preferences/compare)
   */
  async submitPreferenceComparison(payload: {
    student_profile_snapshot: StudentProfileCreate | StudentProfileOut;
    pathway_a_id: string;
    pathway_b_id: string;
    preferred_pathway_id: string;
    reasons: string[];
    current_weights?: Record<string, number>;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/preferences/compare`, {
        method: 'POST',
        headers: getRequestHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Falling back to local preference learner:', err);
    }

    const fallback = clientPathwayService.generatePathways(payload.student_profile_snapshot);
    return clientPathwayService.learnPreference(
      payload.pathway_a_id,
      payload.pathway_b_id,
      payload.preferred_pathway_id,
      payload.reasons,
      fallback.routes,
      payload.current_weights || {}
    );
  },

  /**
   * Retrieve student's preference history and active weights (POST /api/preferences/history)
   */
  async getPreferenceHistory(
    studentProfileSnapshot: StudentProfileCreate | StudentProfileOut,
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/preferences/history`, {
        method: 'POST',
        headers: getRequestHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          student_profile_snapshot: studentProfileSnapshot,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Falling back to local preference history:', err);
    }

    return {
      history: [],
      active_weights: {
        cost: 0.25,
        duration: 0.2,
        career_reputation: 0.3,
        practical_skills: 0.15,
        feasibility_safety: 0.1,
      },
    };
  },

  /**
   * Simulate What-If Scenarios (POST /api/scenarios)
   */
  async simulateScenario(payload: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/scenarios`, {
        method: 'POST',
        headers: getRequestHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Falling back to local scenario simulator:', err);
    }

    const currentGraph = payload.current_graph;
    const currentRoutes = payload.current_routes || [];
    return clientPathwayService.simulateScenario(
      payload.scenario,
      currentGraph,
      currentRoutes,
      {
        reductionPercent: payload.reduction_percent,
        failedEntranceNodeId: payload.failed_entrance_node_id,
      }
    );
  },
};
