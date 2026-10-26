/**
 * Central API client module (Section 7)
 * Handles credentials, Demo Mode header propagation, and standardized error parsing.
 */

const DEMO_MODE_STORAGE_KEY = 'skillbridge_demo_active';

export function isDemoModeActive() {
  try {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
      return true;
    }
    return sessionStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDemoModeActive(active) {
  try {
    if (active) {
      sessionStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(DEMO_MODE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, demoOverride, headers = {} } = options;

  const useDemo =
    demoOverride !== undefined ? Boolean(demoOverride) : isDemoModeActive();

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (useDemo) {
    reqHeaders['X-Demo-Mode'] = 'true';
  }

  const response = await fetch(path, {
    method,
    headers: reqHeaders,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errMessage =
      payload?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errMessage);
    err.status = response.status;
    err.code = payload?.error?.code || 'API_ERROR';
    err.details = payload?.error?.details || [];
    throw err;
  }

  return payload;
}

export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => apiRequest(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: 'DELETE' })
};
