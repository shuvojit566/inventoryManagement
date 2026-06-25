import create from 'zustand'
import * as api from '../utils/api'

const useStore = create((set, get) => ({
  businesses: [],
  activeBusinessId: null,
  products: [],
  customers: [],
  sales: [],
  expenses: [],
  settings: {
    requireGSTIN: false,
    stopOnNegativeStock: true,
    passcodeLock: false,
    auditTrail: true,
    printTheme: 'GST Theme 1',
  },
  loading: false,
  error: null,

  // Initialize store from database
  initStore: async () => {
    set({ loading: true })
    try {
      const [businesses, products, customers, sales, expenses, settings] = await Promise.all([
        api.fetchBusinesses(),
        api.fetchProducts(),
        api.fetchCustomers(),
        api.fetchSales(),
        api.fetchExpenses(),
        api.fetchSettings().catch(() => ({
          requireGSTIN: false,
          stopOnNegativeStock: true,
          passcodeLock: false,
          auditTrail: true,
          printTheme: 'GST Theme 1',
        })),
      ])
      set({
        businesses,
        products,
        customers,
        sales,
        expenses,
        settings: Array.isArray(settings) && settings[0] ? settings[0] : settings,
        activeBusinessId: businesses?.[0]?.id || null,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // Products
  addProduct: async (product) => {
    try {
      const newProduct = await api.addProduct({
        ...product,
        id: `p${Date.now()}`,
      })
      set(state => ({ products: [...state.products, newProduct] }))
      return newProduct
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateProduct: async (id, product) => {
    try {
      const updated = await api.updateProduct(id, product)
      set(state => ({
        products: state.products.map(p => (p.id === id ? updated : p)),
      }))
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

  getProduct: (id) => {
    const state = get()
    return state.products.find(p => p.id === id)
  },

  // Customers
  addCustomer: async (customer) => {
    try {
      const newCustomer = await api.addCustomer({
        ...customer,
        id: `c${Date.now()}`,
        balance: customer.balance || 0,
      })
      set(state => ({ customers: [...state.customers, newCustomer] }))
      return newCustomer
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const updated = await api.updateCustomer(id, customer)
      set(state => ({
        customers: state.customers.map(c => (c.id === id ? updated : c)),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getCustomer: (id) => {
    const state = get()
    return state.customers.find(c => c.id === id)
  },

  // Sales
  addSale: async (sale) => {
    try {
      const newSale = await api.addSale({
        ...sale,
        id: Date.now(),
        date: sale.date || new Date().toISOString(),
      })
      set(state => ({ sales: [...state.sales, newSale] }))
      
      // Update customer balance if on credit
      if (sale.customerId && sale.paymentMode === 'credit') {
        const customer = get().getCustomer(sale.customerId)
        if (customer) {
          await get().updateCustomer(sale.customerId, {
            ...customer,
            balance: (customer.balance || 0) + (sale.total || 0),
          })
        }
      }
      
      // Update product stock
      if (sale.items) {
        for (const item of sale.items) {
          const product = get().getProduct(item.productId)
          if (product) {
            await get().updateProduct(item.productId, {
              ...product,
              stock: Math.max(0, product.stock - (item.qty || 0)),
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
    const state = get()
    const today = api.getTodayDateStr()
    return state.sales.filter(s => s.date.startsWith(today))
  },

  // Expenses
  addExpense: async (expense) => {
    try {
      const newExpense = await api.addExpense({
        ...expense,
        id: Date.now(),
        date: expense.date || new Date().toISOString(),
      })
      set(state => ({ expenses: [...state.expenses, newExpense] }))
      return newExpense
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const updated = await api.updateExpense(id, expense)
      set(state => ({
        expenses: state.expenses.map(e => (e.id === id ? updated : e)),
      }))
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
    const state = get()
    const today = api.getTodayDateStr()
    return state.expenses.filter(e => e.date.startsWith(today))
  },

  // Settings
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

  // Utility
  getTotalReceivables: () => {
    const state = get()
    return state.customers.reduce((sum, c) => sum + Math.max(0, c.balance || 0), 0)
  },

  getTotalTodaysSales: () => {
    return get()
      .getSalesToday()
      .reduce((sum, s) => sum + (s.total || 0), 0)
  },

  getTotalTodaysExpenses: () => {
    return get()
      .getExpensesToday()
      .reduce((sum, e) => sum + (e.amount || 0), 0)
  },

  getLowStockProducts: (threshold = 10) => {
    const state = get()
    return state.products.filter(p => (p.stock || 0) <= threshold)
  },
}))

export default useStore

