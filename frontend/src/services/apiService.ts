/**
 * EduPath API Service
 * Manages communication with FastAPI backend.
 * Integrates Supabase JWT authentication token for server-side verification.
 */

import { StudentProfileCreate, StudentProfileOut } from '../types/studentProfile';

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
   * The endpoint accepts the authenticated student's profile snapshot; it does
   * not accept a profile_id-only payload. Keep graph values generic here so the
   * UI can adapt to the backend's graph schema without silently discarding data.
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
    if (!currentAuthToken) {
      throw {
        message: 'Please sign in before generating your pathway.',
        statusCode: 401,
      } satisfies ApiError;
    }

    const res = await fetch(`${API_BASE}/api/pathways`, {
      method: 'POST',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        student_profile_snapshot: studentProfileSnapshot,
        current_graph: options.currentGraph ?? null,
        current_node_ids_to_expand: options.currentNodeIdsToExpand ?? [],
        candidate_node_count: options.candidateNodeCount ?? 4,
        generation_intent: options.generationIntent ?? 'initial',
      }),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },

  /**
   * What-If Scenario Simulations Stub (POST /api/scenarios)
   */
  async simulateScenario(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/scenarios`, {
      method: 'POST',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    return res.json();
  },
};
