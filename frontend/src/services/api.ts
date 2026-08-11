import { mockDb, initializeMockDb } from './mockDb';
import API_URL from '../config/api';

initializeMockDb();

let isMockActive = false;

export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/subjects/`, { method: 'OPTIONS' });
    isMockActive = false;
    console.log(`[StudySphere AI] Connected to Django REST API at ${API_URL}`);
    return true;
  } catch (e) {
    console.warn(`[StudySphere AI] Probing backend server at ${API_URL}...`, e);
    return false;
  }
};

checkBackendConnection();

export const getMockActive = () => isMockActive;
export const setMockActive = (active: boolean) => {
  isMockActive = active;
};

// Standard API Request Helper targeting Django REST Framework
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('ss_token');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Token ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const url = `${API_URL}${endpoint}`;
  const method = options.method || 'GET';

  try {
    const response = await fetch(url, fetchOptions);
    
    if (response.status === 401 && endpoint !== '/auth/login/' && endpoint !== '/auth/register/') {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
      window.dispatchEvent(new Event('auth-change'));
    }

    if (response.status === 204) {
      return null;
    }

    let data: any;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text.length < 200 ? text : `Server returned HTTP ${response.status}` };
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      console.error(`[API Request Failed] ${method} ${url} | HTTP Status: ${response.status}`, data);
      throw { 
        status: response.status, 
        data: typeof data === 'object' && data !== null ? data : { error: String(data) } 
      };
    }
    return data;
  } catch (err: any) {
    // If it's an HTTP error response from Django (e.g. 400 Bad Request, 401, 403, 404, 500)
    if (err && typeof err.status === 'number' && err.status > 0) {
      console.error(`[Django API HTTP Error ${err.status}] ${method} ${url}:`, err.data);
      throw err;
    }
    
    // Connection Failure (Network error / server offline)
    console.error(`[API Network Connection Failure] Failed to reach ${method} ${url}:`, err);
    throw { 
      status: 0, 
      data: { error: `Unable to connect to the StudySphere server at ${url}. Please try again.` } 
    };
  }
};
