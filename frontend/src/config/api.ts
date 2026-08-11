// Centralized API configuration module
// Supports VITE_API_BASE_URL and VITE_API_URL environment variables
let raw = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://studysphere-pvvn.onrender.com/api'
).trim();

// Remove trailing slashes
if (raw.endsWith('/')) {
  raw = raw.slice(0, -1);
}

// Ensure /api path suffix is present for REST endpoints
if (!raw.endsWith('/api')) {
  raw = `${raw}/api`;
}

export const API_URL = raw;

export const BACKEND_BASE_URL = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)
  : API_URL;

export default API_URL;
