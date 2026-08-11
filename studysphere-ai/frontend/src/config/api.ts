// Centralized API configuration module
// Default fallback points directly to live Render backend: https://studysphere-pvvn.onrender.com/api
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://studysphere-pvvn.onrender.com/api';

// Normalize API URL to ensure trailing /api path structure
export const API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

// Base domain URL without /api suffix (useful for backend static/media assets or admin checks)
export const BACKEND_BASE_URL = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)
  : API_URL;

export default API_URL;
