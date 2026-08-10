import { mockDb, initializeMockDb } from './mockDb';

// Centralised HTTP client connecting to Django REST API (http://127.0.0.1:8000/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

initializeMockDb();

let isMockActive = false;

export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL.replace('/api', '')}/admin/login/`, { method: 'HEAD' });
    isMockActive = false;
    console.log("[StudySphere AI] Django REST API Backend is ONLINE at http://127.0.0.1:8000.");
    return true;
  } catch (e) {
    console.log("[StudySphere AI] Checking backend server status at http://127.0.0.1:8000.");
    return false;
  }
};

checkBackendConnection();

export const getMockActive = () => isMockActive;
export const setMockActive = (active: boolean) => {
  isMockActive = active;
};

// Standard API Request Helper targeting real Django REST Framework
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
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);

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

    console.log(`[API Response] ${response.status} ${url}`, data);

    if (!response.ok) {
      throw { status: response.status, data };
    }
    return data;
  } catch (err: any) {
    // If it's an API HTTP error response (e.g. 400 Bad Request, 401, 403, 500)
    if (err && typeof err.status === 'number' && err.status > 0) {
      console.error(`[API HTTP Error ${err.status}] ${url}:`, err.data);
      throw err;
    }
    
    // TypeError is thrown on complete network failure (e.g. server down)
    console.error(`[API Connection Failure] Could not connect to Django backend at ${url}:`, err);
    throw { 
      status: 0, 
      data: { error: 'Unable to connect to Django REST API server at http://127.0.0.1:8000/.' } 
    };
  }
};
