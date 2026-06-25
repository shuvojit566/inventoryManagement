// API utilities to communicate with json-server
const API_BASE = 'http://localhost:4000'

// Businesses
export async function fetchBusinesses() {
  const res = await fetch(`${API_BASE}/businesses`)
  return res.json()
}

export async function addBusiness(business) {
  const res = await fetch(`${API_BASE}/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(business),
  })
  return res.json()
}

// Products
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`)
  return res.json()
}

export async function addProduct(product) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  return res.json()
}

export async function updateProduct(id, product) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  return res.json()
}

export async function deleteProduct(id) {
  await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
}

// Customers
export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers`)
  return res.json()
}

export async function addCustomer(customer) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
  return res.json()
}

export async function updateCustomer(id, customer) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
  return res.json()
}

// Sales
export async function fetchSales() {
  const res = await fetch(`${API_BASE}/sales`)
  return res.json()
}

export async function addSale(sale) {
  const res = await fetch(`${API_BASE}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  })
  return res.json()
}

export async function fetchSaleById(id) {
  const res = await fetch(`${API_BASE}/sales/${id}`)
  return res.json()
}

export async function updateSale(id, sale) {
  const res = await fetch(`${API_BASE}/sales/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  })
  return res.json()
}

export async function deleteSale(id) {
  await fetch(`${API_BASE}/sales/${id}`, { method: 'DELETE' })
}

// Expenses
export async function fetchExpenses() {
  const res = await fetch(`${API_BASE}/expenses`)
  return res.json()
}

export async function addExpense(expense) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
  return res.json()
}

export async function updateExpense(id, expense) {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
  return res.json()
}

export async function deleteExpense(id) {
  await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' })
}

// Settings
export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`)
  return res.json()
}

export async function saveSettings(settings) {
  const res = await fetch(`${API_BASE}/settings/default`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  return res.json()
}

// Helper to fetch sales for a specific date
export async function fetchSalesByDate(dateStr) {
  const res = await fetch(`${API_BASE}/sales?_sort=date&_order=desc`)
  const sales = await res.json()
  return sales.filter(s => s.date.startsWith(dateStr))
}

// Helper to get today's total
export function getTodayDateStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}
