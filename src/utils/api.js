// Get API base URL from environment or detect current server
const getAPIBase = () => {
  // CRITICAL: If explicitly set in environment, ALWAYS use it (production)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim()
    if (url) {
      console.debug('[API] Using VITE_API_URL from environment:', url)
      return url
    }
  }

  // Development environment detection
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol // http: or https:
    const hostname = window.location.hostname // localhost, 127.0.0.1, or IP
    const port = window.location.port
    
    // Development: Vite dev server on port 5173
    if (port === '5173') {
      const devUrl = `${protocol}//${hostname}:4000`
      console.debug('[API] Dev mode detected (port 5173), using backend:', devUrl)
      return devUrl
    }
    
    // Local network: Check if running on machine IP (e.g., 192.168.x.x)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('.')) {
      // Local IP detected (like 192.168.1.100)
      const localUrl = `${protocol}//${hostname}:4000`
      console.debug('[API] Local network detected, using backend:', localUrl)
      return localUrl
    }
    
    // Production warning: No VITE_API_URL set
    // This will fail! Environment variable must be set for production
    const fallbackUrl = `${protocol}//${hostname}:4000`
    console.warn(
      '[API] WARNING: VITE_API_URL not set for production. ' +
      'This will likely fail. Expected to connect to: ' + fallbackUrl +
      '\nFix: Set VITE_API_URL environment variable in Netlify build settings.'
    )
    return fallbackUrl
  }

  // Server-side rendering or non-browser environment
  // This fallback won't work - environment variable MUST be set
  const fallback = 'http://localhost:4000'
  console.error('[API] No browser environment. Returning fallback:', fallback)
  return fallback
}

const API_BASE = getAPIBase()

function getSavedSession() {
  const raw = window.localStorage.getItem('inventory-session') || window.sessionStorage.getItem('inventory-session')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
}

function getAuthHeaders() {
  const session = getSavedSession()
  const userId = session?.id || session?.userId
  return userId ? { Authorization: `Bearer ${userId}` } : {}
}

async function request(path, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }

  const init = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_BASE}${path}`, init)
  if (!response.ok) {
    const errorText = await response.text()
    let message = response.statusText
    try {
      const payload = JSON.parse(errorText)
      message = payload.error || payload.message || message
    } catch (err) {
      if (errorText) message = errorText
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function buildQuery(params = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return query ? `?${query}` : ''
}

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function loginUser({ email, passwordHash }) {
  return request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, passwordHash }),
  })
}

export async function registerUser(payload) {
  return request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function resetPassword(payload) {
  return request('/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function fetchBusinesses(userId) {
  return request(`/businesses${buildQuery({ userId })}`)
}

export async function addBusiness(business) {
  return request('/businesses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(business),
  })
}

export async function fetchProducts(userId) {
  return request(`/products${buildQuery({ userId })}`)
}

export async function addProduct(product) {
  return request('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
}

export async function updateProduct(id, product) {
  return request(`/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
}

export async function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

export async function fetchCustomers(userId) {
  return request(`/customers${buildQuery({ userId })}`)
}

export async function addCustomer(customer) {
  return request('/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
}

export async function updateCustomer(id, customer) {
  return request(`/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
}

export async function fetchSales(userId) {
  return request(`/sales${buildQuery({ userId })}`)
}

export async function addSale(sale) {
  return request('/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  })
}

export async function fetchSaleById(id) {
  return request(`/sales/${id}`)
}

export async function updateSale(id, sale) {
  return request(`/sales/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  })
}

export async function deleteSale(id) {
  return request(`/sales/${id}`, { method: 'DELETE' })
}

export async function fetchPurchases(userId) {
  return request(`/purchases${buildQuery({ userId })}`)
}

export async function addPurchase(purchase) {
  return request('/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchase),
  })
}

export async function fetchPurchaseById(id) {
  return request(`/purchases/${id}`)
}

export async function updatePurchase(id, purchase) {
  return request(`/purchases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchase),
  })
}

export async function deletePurchase(id) {
  return request(`/purchases/${id}`, { method: 'DELETE' })
}

export async function fetchExpenses(userId) {
  return request(`/expenses${buildQuery({ userId })}`)
}

export async function addExpense(expense) {
  return request('/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
}

export async function updateExpense(id, expense) {
  return request(`/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
}

export async function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: 'DELETE' })
}

export async function fetchSettings(userId) {
  return request(`/settings${buildQuery({ userId })}`)
}

export async function saveSettings(settings) {
  if (settings?.id) {
    return request(`/settings/${settings.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
  }
  return request('/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export async function fetchUser(id) {
  return request(`/users/${id}`)
}

export async function updateUser(id, user) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
}

export async function deleteAccount(password) {
  return request('/account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

export async function adminLogin({ email, passwordHash }) {
  return request('/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, passwordHash }),
  })
}

export async function fetchAllUsers(page = 1, limit = 10) {
  return request(`/admin/users${buildQuery({ page, limit })}`)
}

export async function searchUsers(searchTerm) {
  return request(`/admin/users/search/${encodeURIComponent(searchTerm)}`)
}

export async function getUserDetails(userId) {
  return request(`/admin/users/${userId}`)
}

export async function updateUserStatus(userId, status) {
  return request(`/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export async function resetUserPassword(userId) {
  return request(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function deleteUser(userId) {
  return request(`/admin/users/${userId}`, { method: 'DELETE' })
}

export async function getDashboardStats() {
  return request('/admin/dashboard-stats')
}

export function getTodayDateStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}
