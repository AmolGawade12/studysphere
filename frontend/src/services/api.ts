import { mockDb, initializeMockDb } from './mockDb';
import API_URL, { BACKEND_BASE_URL } from '../config/api';

initializeMockDb();

let isMockActive = false;

export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const adminUrl = `${BACKEND_BASE_URL}/admin/login/`;
    const res = await fetch(adminUrl, { method: 'HEAD' });
    isMockActive = false;
    console.log(`[StudySphere AI] Connected to Django REST API at ${API_URL}`);
    return true;
  } catch (e) {
    console.log(`[StudySphere AI] Probing backend server status at ${API_URL}...`);
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

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw { status: response.status, data };
    }
    return data;
  } catch (err: any) {
    // If it's an HTTP error response from Django (e.g. 400 Bad Request, 401, 403, 500)
    if (err && typeof err.status === 'number' && err.status > 0) {
      console.error(`[API Error ${err.status}] ${url}:`, err.data);
      throw err;
    }
    
    // Connection Failure (Network error / server offline)
    console.error(`[API Network Connection Error] Failed to reach ${url}:`, err);
    throw { 
      status: 0, 
      data: { error: 'Unable to connect to the StudySphere server. Please try again.' } 
    };
  }
};
