/**
 * EduPath Authentication Service
 * Connects to FastAPI backend authentication endpoints.
 * Explicitly verifies server route availability without inventing fake tokens.
 */

import { API_BASE, ApiError } from './apiService';

export interface User {
  id: number;
  email: string;
  preferred_name?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export const authService = {
  /**
   * Current active user state (null by default; does NOT assume mock login)
   */
  _currentUser: null as User | null,

  getCurrentUser(): User | null {
    return this._currentUser;
  },

  /**
   * Check whether authentication routes are active on the backend
   */
  async checkAuthStatus(): Promise<{ supported: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        return { supported: true, message: 'FastAPI Authentication is active.' };
      }
    } catch {
      // route not found
    }
    return {
      supported: false,
      message: 'FastAPI Authentication routes (/api/auth/login, /api/auth/register) are not yet deployed on the backend.',
    };
  },

  /**
   * User login attempt: POST /api/auth/login
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 404 || res.status === 405) {
        throw {
          statusCode: 404,
          message: 'The backend authentication route (/api/auth/login) is not yet implemented on the FastAPI server. User accounts require database user model and OAuth2/JWT routes.',
        } as ApiError;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw {
          statusCode: res.status,
          message: errorData.detail || 'Sign-in failed. Please verify your email and password.',
        } as ApiError;
      }

      const data = await res.json();
      const user: User = data.user || { id: data.id || 1, email };
      this._currentUser = user;
      return user;
    } catch (err: any) {
      if (err.statusCode) throw err;
      throw {
        statusCode: 0,
        message: 'The backend authentication endpoint (/api/auth/login) is not yet available on the server.',
      } as ApiError;
    }
  },

  /**
   * User registration attempt: POST /api/auth/register
   */
  async register(preferred_name: string, email: string, password: string): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ preferred_name, email, password }),
      });

      if (res.status === 404 || res.status === 405) {
        throw {
          statusCode: 404,
          message: 'The backend registration route (/api/auth/register) is not yet deployed on the FastAPI server. User accounts require database user model and hashing routes.',
        } as ApiError;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw {
          statusCode: res.status,
          message: errorData.detail || 'Registration failed. Please check the provided information.',
        } as ApiError;
      }

      const data = await res.json();
      const user: User = data.user || { id: data.id || 1, email, preferred_name };
      this._currentUser = user;
      return user;
    } catch (err: any) {
      if (err.statusCode) throw err;
      throw {
        statusCode: 0,
        message: 'The backend registration endpoint (/api/auth/register) is not yet available on the server.',
      } as ApiError;
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this._currentUser = null;
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }
  },
};
