import create from 'zustand'
import * as api from '../utils/api'
import { toNumber } from '../utils/math'
import { sanitizePhoneInput } from '../utils/phone'

const normalizeProduct = product => ({
  ...product,
  price: toNumber(product.price),
  purchasePrice: toNumber(product.purchasePrice),
  sellingPrice: toNumber(product.sellingPrice || product.price),
  gst: toNumber(product.gst),
  stock: toNumber(product.stock),
})

const normalizeCustomer = customer => ({
  ...customer,
  phone: customer.phone || '',
  email: customer.email || '',
  address: customer.address || '',
  gst: customer.gst || '',
  type: customer.type || 'selling',
  balance: toNumber(customer.balance),
})

const getDuplicateCustomerError = (customers, customer, excludeId = null) => {
  const phone = sanitizePhoneInput(customer.phone || '')
  if (phone) {
    const duplicate = customers.find(
      c => sanitizePhoneInput(c.phone || '') === phone && c.id !== excludeId,
    )
    if (duplicate) return 'A customer with this phone number already exists.'
  }

  const gst = (customer.gst || '').trim().toLowerCase()
  if (gst) {
    const duplicate = customers.find(
      c => (c.gst || '').trim().toLowerCase() === gst && c.id !== excludeId,
    )
    if (duplicate) return 'A customer with this GST number already exists.'
  }

  return null
}

const normalizeSaleItem = item => ({
  ...item,
  qty: toNumber(item.qty),
  price: toNumber(item.price),
  discount: toNumber(item.discount),
  tax: toNumber(item.tax),
  amount: toNumber(item.amount),
})

const normalizeSale = sale => ({
  ...sale,
  total: toNumber(sale.total),
  items: Array.isArray(sale.items) ? sale.items.map(normalizeSaleItem) : [],
})

const normalizePurchaseItem = item => ({
  ...item,
  qty: toNumber(item.qty),
  price: toNumber(item.price),
  discount: toNumber(item.discount),
  tax: toNumber(item.tax),
  amount: toNumber(item.amount),
})

const normalizePurchase = purchase => ({
  ...purchase,
  total: toNumber(purchase.total),
  items: Array.isArray(purchase.items) ? purchase.items.map(normalizePurchaseItem) : [],
})

const normalizeExpense = expense => ({
  ...expense,
  amount: toNumber(expense.amount),
})

const DEFAULT_SETTINGS = {
  requireGSTIN: false,
  stopOnNegativeStock: true,
  passcodeLock: false,
  auditTrail: true,
  printTheme: 'GST Theme 1',
}

const useStore = create((set, get) => ({
  businesses: [],
  activeBusinessId: null,
  products: [],
  customers: [],
  sales: [],
  purchases: [],
  expenses: [],
  settings: DEFAULT_SETTINGS,
  currentUser: null,
  authError: null,
  authLoading: false,
  loading: false,
  error: null,

  restoreSession: () => {
    const raw = window.localStorage.getItem('inventory-session') || window.sessionStorage.getItem('inventory-session')
    if (!raw) return null
    try {
      const currentUser = JSON.parse(raw)
      set({ currentUser, authError: null })
      return currentUser
    } catch {
      return null
    }
  },

  saveSession: (user, remember = true) => {
    const raw = JSON.stringify(user)
    if (remember) {
      window.localStorage.setItem('inventory-session', raw)
      window.sessionStorage.removeItem('inventory-session')
    } else {
      window.sessionStorage.setItem('inventory-session', raw)
      window.localStorage.removeItem('inventory-session')
    }
    set({ currentUser: user, authError: null })
  },

  clearSession: () => {
    window.localStorage.removeItem('inventory-session')
    window.sessionStorage.removeItem('inventory-session')
    set({
      currentUser: null,
      businesses: [],
      activeBusinessId: null,
      products: [],
      customers: [],
      sales: [],
      purchases: [],
      expenses: [],
      settings: DEFAULT_SETTINGS,
      authError: null,
      authLoading: false,
      loading: false,
      error: null,
    })
  },

  login: async ({ email, password, remember }) => {
    set({ authLoading: true, authError: null })
    try {
      const passwordHash = await api.hashPassword(password)
      const user = await api.loginUser({ email, passwordHash })
      get().saveSession(user, remember)
      await get().initStore()
      return user
    } catch (err) {
      set({ authError: err.message })
      throw err
    } finally {
      set({ authLoading: false })
    }
  },

  register: async (payload) => {
    set({ authLoading: true, authError: null })
    try {
      if (payload.password !== payload.confirmPassword) {
        throw new Error('Passwords do not match.')
      }
      const user = await api.registerUser(payload)
      get().saveSession(user, payload.remember)
      await get().initStore()
      return user
    } catch (err) {
      set({ authError: err.message })
      throw err
    } finally {
      set({ authLoading: false })
    }
  },

  logout: () => {
    get().clearSession()
  },

  updateProfile: async (updates) => {
    try {
      const currentUser = get().currentUser
      if (!currentUser?.id) {
        throw new Error('Not authenticated.')
      }
      const updatedUser = await api.updateUser(currentUser.id, updates)
      const mergedUser = { ...currentUser, ...updatedUser }
      get().saveSession(mergedUser, Boolean(window.localStorage.getItem('inventory-session')))
      return mergedUser
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      const currentUser = get().currentUser
      if (!currentUser?.email || !currentUser?.phone) {
        throw new Error('Missing current account details.')
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match.')
      }
      await api.resetPassword({
        email: currentUser.email,
        phone: currentUser.phone,
        newPassword,
      })
      return true
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteAccount: async (password) => {
    try {
      if (!password) {
        throw new Error('Password is required.')
      }
      await api.deleteAccount(password)
      get().clearSession()
      return true
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  initStore: async () => {
    set({ loading: true, error: null })
    const currentUser = get().currentUser
    if (!currentUser?.id) {
      set({ loading: false })
      return
    }

    try {
      const userId = currentUser.id
      const [businesses, products, customers, sales, purchases, expenses, settings] = await Promise.all([
        api.fetchBusinesses(userId),
        api.fetchProducts(userId),
        api.fetchCustomers(userId),
        api.fetchSales(userId),
        api.fetchPurchases(userId).catch(() => []),
        api.fetchExpenses(userId),
        api.fetchSettings(userId).catch(() => DEFAULT_SETTINGS),
      ])

      set({
        businesses,
        products: products.map(normalizeProduct),
        customers: customers.map(normalizeCustomer),
        sales: sales.map(normalizeSale),
        purchases: purchases.map(normalizePurchase),
        expenses: expenses.map(normalizeExpense),
        settings: Array.isArray(settings) && settings[0] ? settings[0] : settings,
        activeBusinessId: businesses?.[0]?.id || null,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  refreshProducts: async () => {
    try {
      const products = await api.fetchProducts(get().currentUser?.id)
      set({ products: products.map(normalizeProduct) })
      return products
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  addProduct: async (product) => {
    const tempId = `tmp-${Date.now()}`
    const optimisticProduct = normalizeProduct({
      stock: 0,
      unit: 'pcs',
      gst: 0,
      ...product,
      id: tempId,
      isSaving: true,
    })
    set(state => ({ products: [...state.products, optimisticProduct] }))

    try {
      const newProduct = normalizeProduct(await api.addProduct({
        stock: 0,
        unit: 'pcs',
        gst: 0,
        ...product,
        price: toNumber(product.price),
        purchasePrice: toNumber(product.purchasePrice),
        sellingPrice: toNumber(product.sellingPrice || product.price),
        gst: toNumber(product.gst),
        stock: toNumber(product.stock),
        id: `p${Date.now()}`,
      }))
      set(state => ({ products: state.products.map(p => (p.id === tempId ? newProduct : p)) }))
      return newProduct
    } catch (err) {
      set(state => ({ products: state.products.filter(p => p.id !== tempId) }))
      set({ error: err.message })
      throw err
    }
  },

  updateProduct: async (id, product) => {
    try {
      const updated = normalizeProduct(await api.updateProduct(id, normalizeProduct(product)))
      set(state => ({ products: state.products.map(p => (p.id === id ? updated : p)) }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id)
      set(state => ({ products: state.products.filter(p => p.id !== id) }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getProduct: (id) => get().products.find(p => p.id === id),

  addCustomer: async (customer) => {
    try {
      const state = get()
      const duplicateError = getDuplicateCustomerError(state.customers, customer)
      if (duplicateError) {
        throw new Error(duplicateError)
      }

      const newCustomer = normalizeCustomer(await api.addCustomer({
        ...customer,
        id: `c${Date.now()}`,
        balance: toNumber(customer.balance),
      }))
      set(state => ({ customers: [...state.customers, newCustomer] }))
      return newCustomer
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const state = get()
      const duplicateError = getDuplicateCustomerError(state.customers, customer, id)
      if (duplicateError) {
        throw new Error(duplicateError)
      }

      const updated = normalizeCustomer(await api.updateCustomer(id, normalizeCustomer(customer)))
      set(state => ({ customers: state.customers.map(c => (c.id === id ? updated : c)) }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getCustomer: (id) => get().customers.find(c => c.id === id),

  addSale: async (sale) => {
    try {
      const saleToSave = normalizeSale({
        ...sale,
        id: Date.now(),
        date: sale.date || new Date().toISOString(),
      })
      const newSale = normalizeSale(await api.addSale(saleToSave))
      set(state => ({ sales: [...state.sales, newSale] }))

      if (saleToSave.customerId && saleToSave.paymentMode === 'credit') {
        const customer = get().getCustomer(saleToSave.customerId)
        if (customer) {
          await get().updateCustomer(saleToSave.customerId, {
            ...customer,
            balance: toNumber(customer.balance) + saleToSave.total,
          })
        }
      }

      if (saleToSave.items) {
        for (const item of saleToSave.items) {
          const product = get().getProduct(item.productId)
          if (product) {
            await get().updateProduct(item.productId, {
              ...product,
              stock: Math.max(0, toNumber(product.stock) - toNumber(item.qty)),
            })
          }
        }
      }

      return newSale
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteSale: async (id) => {
    try {
      await api.deleteSale(id)
      set(state => ({ sales: state.sales.filter(s => s.id !== id) }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getSalesToday: () => {
    const today = api.getTodayDateStr()
    return get().sales.filter(s => s.date.startsWith(today))
  },

  addPurchase: async (purchase) => {
    try {
      const purchaseToSave = normalizePurchase({
        ...purchase,
        id: Date.now(),
        date: purchase.date || new Date().toISOString(),
      })
      const newPurchase = normalizePurchase(await api.addPurchase(purchaseToSave))
      set(state => ({ purchases: [...state.purchases, newPurchase] }))

      if (purchaseToSave.supplierId && purchaseToSave.paymentMode === 'credit') {
        const supplier = get().getCustomer(purchaseToSave.supplierId)
        if (supplier) {
          await get().updateCustomer(purchaseToSave.supplierId, {
            ...supplier,
            balance: toNumber(supplier.balance) - purchaseToSave.total,
          })
        }
      }

      if (purchaseToSave.items) {
        for (const item of purchaseToSave.items) {
          const product = get().getProduct(item.productId)
          if (product) {
            await get().updateProduct(item.productId, {
              ...product,
              stock: toNumber(product.stock) + toNumber(item.qty),
            })
          }
        }
      }

      return newPurchase
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deletePurchase: async (id) => {
    try {
      await api.deletePurchase(id)
      set(state => ({ purchases: state.purchases.filter(p => p.id !== id) }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getPurchasesToday: () => {
    const today = api.getTodayDateStr()
    return get().purchases.filter(p => p.date.startsWith(today))
  },

  addExpense: async (expense) => {
    try {
      const newExpense = normalizeExpense(await api.addExpense({
        ...expense,
        id: Date.now(),
        date: expense.date || new Date().toISOString(),
        amount: toNumber(expense.amount),
      }))
      set(state => ({ expenses: [...state.expenses, newExpense] }))
      return newExpense
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const updated = normalizeExpense(await api.updateExpense(id, normalizeExpense(expense)))
      set(state => ({ expenses: state.expenses.map(e => (e.id === id ? updated : e)) }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.deleteExpense(id)
      set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getExpensesToday: () => {
    const today = api.getTodayDateStr()
    return get().expenses.filter(e => e.date.startsWith(today))
  },

  updateSettings: async (settings) => {
    try {
      const updated = await api.saveSettings(settings).catch(() => settings)
      set({ settings: updated })
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getTotalReceivables: () => {
    return get().customers.reduce((sum, c) => sum + Math.max(0, toNumber(c.balance)), 0)
  },

  getTotalTodaysSales: () => {
    return get().getSalesToday().reduce((sum, s) => sum + toNumber(s.total), 0)
  },

  getTotalTodaysPurchases: () => {
    return get().getPurchasesToday().reduce((sum, p) => sum + toNumber(p.total), 0)
  },

  getTotalTodaysExpenses: () => {
    return get().getExpensesToday().reduce((sum, e) => sum + toNumber(e.amount), 0)
  },

  getTotalRevenue: () => {
    return get().sales.reduce((sum, s) => {
      const partsTotal = Array.isArray(s.items) ? s.items.reduce((a, i) => a + toNumber(i.amount), 0) : 0
      const mech = toNumber(s.mechanicCharge) || 0
      const labour = toNumber(s.labourCharge) || 0
      const install = toNumber(s.installationCharge) || 0
      const service = toNumber(s.serviceCharge) || 0
      const other = toNumber(s.otherCharges) || 0
      return sum + partsTotal + mech + labour + install + service + other
    }, 0)
  },

  getLowStockProducts: (threshold = 10) => {
    return get().products.filter(p => toNumber(p.stock) <= threshold)
  },

  // Admin-related methods
  adminLogin: async ({ email, password, remember }) => {
    set({ authLoading: true, authError: null })
    try {
      const passwordHash = await api.hashPassword(password)
      const user = await api.adminLogin({ email, passwordHash })
      if (user.role !== 'ADMIN') {
        throw new Error('Admin access required.')
      }
      get().saveSession(user, remember)
      return user
    } catch (err) {
      set({ authError: err.message })
      throw err
    } finally {
      set({ authLoading: false })
    }
  },

  adminLogout: () => {
    get().clearSession()
  },

  fetchAllUsers: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const users = await api.fetchAllUsers(page, limit)
      return users
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  searchUsersAdmin: async (searchTerm) => {
    set({ loading: true, error: null })
    try {
      const users = await api.searchUsers(searchTerm)
      return users
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  getUserDetailsAdmin: async (userId) => {
    set({ loading: true, error: null })
    try {
      const user = await api.getUserDetails(userId)
      return user
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  updateUserStatusAdmin: async (userId, status) => {
    set({ loading: true, error: null })
    try {
      const user = await api.updateUserStatus(userId, status)
      return user
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  resetUserPasswordAdmin: async (userId) => {
    set({ loading: true, error: null })
    try {
      await api.resetUserPassword(userId)
      return true
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  deleteUserAdmin: async (userId) => {
    set({ loading: true, error: null })
    try {
      await api.deleteUser(userId)
      return true
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  getDashboardStatsAdmin: async () => {
    set({ loading: true, error: null })
    try {
      const stats = await api.getDashboardStats()
      return stats
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },
}))

export default useStore
