import { mockService } from '../mocks/mockService';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

export const isUsingMockData = () => USE_MOCK_DATA;
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Generic fetch wrapper for backend API calls
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    if (err.message && err.message.startsWith('API Error')) {
      throw err;
    }
    throw new Error(`Backend API Unavailable at ${API_BASE_URL}. Ensure the Go backend server is running on port 8090.`);
  }
}

export { mockService };

// Maps UI params onto the Go server's query names and adds the total_pages the
// list pages expect. Empty params are dropped.
const SERVER_PARAMS = { sortBy: 'sort', pulseId: 'pulse_id' };

export async function apiList(endpoint, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) query.set(SERVER_PARAMS[key] || key, value);
  });
  const res = await apiFetch(`${endpoint}?${query}`);
  return { ...res, total_pages: Math.max(1, Math.ceil((res.total || 0) / (res.limit || 1))) };
}
