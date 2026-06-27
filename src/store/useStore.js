import create from 'zustand'
import * as api from '../utils/api'
import { toNumber } from '../utils/math'

const normalizeProduct = product => ({
  ...product,
  price: toNumber(product.price),
  stock: toNumber(product.stock),
})

const normalizeCustomer = customer => ({
  ...customer,
  balance: toNumber(customer.balance),
})

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

const useStore = create((set, get) => ({
  businesses: [],
  activeBusinessId: null,
  products: [],
  customers: [],
  sales: [],
  purchases: [],
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
      const [businesses, products, customers, sales, purchases, expenses, settings] = await Promise.all([
        api.fetchBusinesses(),
        api.fetchProducts(),
        api.fetchCustomers(),
        api.fetchSales(),
        api.fetchPurchases().catch(() => []),
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

  // Products
  addProduct: async (product) => {
    try {
      const newProduct = normalizeProduct(await api.addProduct({
        ...product,
        price: toNumber(product.price),
        stock: toNumber(product.stock),
        id: `p${Date.now()}`,
      }))
      set(state => ({ products: [...state.products, newProduct] }))
      return newProduct
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateProduct: async (id, product) => {
    try {
      const updated = normalizeProduct(await api.updateProduct(id, normalizeProduct(product)))
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
      const updated = normalizeCustomer(await api.updateCustomer(id, normalizeCustomer(customer)))
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
      const saleToSave = normalizeSale({
        ...sale,
        id: Date.now(),
        date: sale.date || new Date().toISOString(),
      })
      const newSale = normalizeSale(await api.addSale(saleToSave))
      set(state => ({ sales: [...state.sales, newSale] }))
      
      // Update customer balance if on credit
      if (saleToSave.customerId && saleToSave.paymentMode === 'credit') {
        const customer = get().getCustomer(saleToSave.customerId)
        if (customer) {
          await get().updateCustomer(saleToSave.customerId, {
            ...customer,
            balance: toNumber(customer.balance) + saleToSave.total,
          })
        }
      }
      
      // Update product stock
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
    const state = get()
    const today = api.getTodayDateStr()
    return state.sales.filter(s => s.date.startsWith(today))
  },

  // Purchases
  addPurchase: async (purchase) => {
    try {
      const purchaseToSave = normalizePurchase({
        ...purchase,
        id: Date.now(),
        date: purchase.date || new Date().toISOString(),
      })
      const newPurchase = normalizePurchase(await api.addPurchase(purchaseToSave))
      set(state => ({ purchases: [...state.purchases, newPurchase] }))

      // Update supplier balance if on credit. Negative balance means we owe the party.
      if (purchaseToSave.supplierId && purchaseToSave.paymentMode === 'credit') {
        const supplier = get().getCustomer(purchaseToSave.supplierId)
        if (supplier) {
          await get().updateCustomer(purchaseToSave.supplierId, {
            ...supplier,
            balance: toNumber(supplier.balance) - purchaseToSave.total,
          })
        }
      }

      // Update product stock
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
    const state = get()
    const today = api.getTodayDateStr()
    return state.purchases.filter(p => p.date.startsWith(today))
  },

  // Expenses
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
    return state.customers.reduce((sum, c) => sum + Math.max(0, toNumber(c.balance)), 0)
  },

  getTotalTodaysSales: () => {
    return get()
      .getSalesToday()
      .reduce((sum, s) => sum + toNumber(s.total), 0)
  },

  getTotalTodaysPurchases: () => {
    return get()
      .getPurchasesToday()
      .reduce((sum, p) => sum + toNumber(p.total), 0)
  },

  getTotalTodaysExpenses: () => {
    return get()
      .getExpensesToday()
      .reduce((sum, e) => sum + toNumber(e.amount), 0)
  },

  getLowStockProducts: (threshold = 10) => {
    const state = get()
    return state.products.filter(p => toNumber(p.stock) <= threshold)
  },
}))

export default useStore

