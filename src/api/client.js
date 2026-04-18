const BASE_URL = 'http://localhost:3001'

/**
 * Generic API client for Zuvlyn Finance
 */
export async function apiFetch(endpoint, options = {}) {
  const { token, ...customConfig } = options

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  }

  const config = {
    ...customConfig,
    headers,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const authApi = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: payload }),
  getMe: (token) => apiFetch('/auth/me', { token }),
  updateRole: (token, role) => apiFetch('/auth/role', { method: 'PATCH', body: { role }, token }),
}

export const transactionsApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/transactions?${query}`, { token })
  },
  create: (token, payload) => apiFetch('/api/transactions', { method: 'POST', body: payload, token }),
  update: (token, id, payload) => apiFetch(`/api/transactions/${id}`, { method: 'PATCH', body: payload, token }),
  delete: (token, id) => apiFetch(`/api/transactions/${id}`, { method: 'DELETE', token }),
}

export const analyticsApi = {
  getSummary: (token) => apiFetch('/api/analytics/summary', { token }),
  getTrend: (token) => apiFetch('/api/analytics/trend', { token }),
  getByCategory: (token) => apiFetch('/api/analytics/by-category', { token }),
  getCategories: (token) => apiFetch('/api/analytics/categories', { token }),
}
