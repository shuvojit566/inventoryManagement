import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search, Clock, X, Package, Users, FileText, ShoppingCart, Receipt } from 'lucide-react'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'

const includesQuery = (values, query) =>
  values
    .filter(value => value !== undefined && value !== null)
    .some(value => String(value).toLowerCase().includes(query))

export default function Topbar() {
  const store = useStore()
  const location = useLocation()
  const now = new Date()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const trimmedQuery = query.trim().toLowerCase()

  useEffect(() => {
    setIsFocused(false)
  }, [location.pathname])

  const searchResults = useMemo(() => {
    if (!trimmedQuery) return []

    const productResults = store.products
      .filter(product =>
        includesQuery(
          [product.id, product.name, product.hsn, product.price, product.stock, `stock ${product.stock}`],
          trimmedQuery
        )
      )
      .map(product => ({
        id: `product-${product.id}`,
        type: 'Product',
        icon: Package,
        to: '/items',
        title: product.name || 'Unnamed product',
        subtitle: `HSN ${product.hsn || '-'} | Stock ${toNumber(product.stock)} | Rs. ${toNumber(product.price).toFixed(2)}`,
        badgeClass: 'bg-emerald-100 text-emerald-700',
      }))

    const customerResults = store.customers
      .filter(customer =>
        includesQuery(
          [customer.id, customer.name, customer.phone, customer.balance, `balance ${customer.balance}`],
          trimmedQuery
        )
      )
      .map(customer => ({
        id: `customer-${customer.id}`,
        type: 'Party',
        icon: Users,
        to: '/parties',
        title: customer.name || 'Unnamed party',
        subtitle: `${customer.phone || 'No phone'} | Balance Rs. ${toNumber(customer.balance).toFixed(2)}`,
        badgeClass: 'bg-sky-100 text-sky-700',
      }))

    const saleResults = store.sales
      .filter(sale => {
        const customer = store.getCustomer(sale.customerId)
        const itemNames = sale.items?.map(item => store.getProduct(item.productId)?.name || item.productId) || []
        return includesQuery(
          [
            sale.id,
            `INV-${sale.id}`,
            sale.date,
            sale.paymentMode,
            sale.total,
            customer?.name,
            customer?.phone,
            ...itemNames,
          ],
          trimmedQuery
        )
      })
      .map(sale => ({
        id: `sale-${sale.id}`,
        type: 'Sale',
        icon: FileText,
        to: '/reports',
        title: `Sale INV-${sale.id}`,
        subtitle: `${store.getCustomer(sale.customerId)?.name || 'Unknown'} | Rs. ${toNumber(sale.total).toFixed(2)} | ${sale.paymentMode || 'cash'}`,
        badgeClass: 'bg-green-100 text-green-700',
      }))

    const purchaseResults = store.purchases
      .filter(purchase => {
        const supplier = store.getCustomer(purchase.supplierId)
        const itemNames = purchase.items?.map(item => store.getProduct(item.productId)?.name || item.productId) || []
        return includesQuery(
          [
            purchase.id,
            `PUR-${purchase.id}`,
            purchase.date,
            purchase.paymentMode,
            purchase.total,
            supplier?.name,
            supplier?.phone,
            ...itemNames,
          ],
          trimmedQuery
        )
      })
      .map(purchase => ({
        id: `purchase-${purchase.id}`,
        type: 'Purchase',
        icon: ShoppingCart,
        to: '/reports',
        title: `Purchase PUR-${purchase.id}`,
        subtitle: `${store.getCustomer(purchase.supplierId)?.name || 'Supplier'} | Rs. ${toNumber(purchase.total).toFixed(2)} | ${purchase.paymentMode || 'cash'}`,
        badgeClass: 'bg-blue-100 text-blue-700',
      }))

    const expenseResults = store.expenses
      .filter(expense =>
        includesQuery(
          [expense.id, expense.description, expense.category, expense.amount, expense.date],
          trimmedQuery
        )
      )
      .map(expense => ({
        id: `expense-${expense.id}`,
        type: 'Expense',
        icon: Receipt,
        to: '/reports',
        title: expense.description || 'Expense',
        subtitle: `${expense.category || 'General'} | Rs. ${toNumber(expense.amount).toFixed(2)}`,
        badgeClass: 'bg-red-100 text-red-700',
      }))

    return [
      ...productResults,
      ...customerResults,
      ...saleResults,
      ...purchaseResults,
      ...expenseResults,
    ].slice(0, 12)
  }, [trimmedQuery, store.products, store.customers, store.sales, store.purchases, store.expenses])

  const showResults = isFocused && trimmedQuery.length > 0

  return (
    <header className="flex items-center justify-between gap-4 p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Link
          to="/sale/new"
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </Link>
        <Link
          to="/items"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          Manage Items
        </Link>
      </div>

      <div className="relative flex-1 max-w-2xl">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search products, parties, sales, purchases..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showResults && (
          <div
            className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-20"
            onMouseDown={e => e.preventDefault()}
          >
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No matching records found
                </div>
              ) : (
                searchResults.map(result => {
                  const Icon = result.icon
                  return (
                    <Link
                      key={result.id}
                      to={result.to}
                      onClick={() => {
                        setQuery('')
                        setIsFocused(false)
                      }}
                      className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 transition"
                    >
                      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-gray-900 truncate">{result.title}</p>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${result.badgeClass}`}>
                            {result.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{result.subtitle}</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
                Showing {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Active:</span>
          <span className="font-semibold text-gray-900 ml-1">Acme Traders</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs text-green-600 font-medium">Connected</span>
      </div>
    </header>
  )
}

