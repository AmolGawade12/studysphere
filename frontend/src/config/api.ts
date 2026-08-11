// Centralized API configuration module
// Ensures /api is always attached regardless of input format
let raw = (import.meta.env.VITE_API_URL || 'https://studysphere-pvvn.onrender.com/api').trim();
if (raw.endsWith('/')) {
  raw = raw.slice(0, -1);
}

if (!raw.endsWith('/api')) {
  raw = `${raw}/api`;
}

export const API_URL = raw;

export const BACKEND_BASE_URL = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)
  : API_URL;

export default API_URL;
