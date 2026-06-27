import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BalanceSheet from '../components/BalanceSheet'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
} from 'lucide-react'

function formatMoney(value) {
  return `Rs. ${toNumber(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB')
}

export default function Reports() {
  const store = useStore()
  const [reportType, setReportType] = useState('sales')
  const [query, setQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date()
    date.setDate(1)
    return date.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])

  const salesRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return store.sales
      .filter(sale => {
        const date = sale.date?.slice(0, 10)
        return (!fromDate || date >= fromDate) && (!toDate || date <= toDate)
      })
      .filter(sale => {
        if (!needle) return true
        const party = store.getCustomer(sale.customerId)
        return [sale.id, party?.name, sale.paymentMode, sale.total]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(needle))
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [store.sales, store.customers, query, fromDate, toDate])

  const salesSummary = useMemo(() => {
    const total = salesRows.reduce((sum, sale) => sum + toNumber(sale.total), 0)
    const received = salesRows.reduce((sum, sale) => {
      if (sale.received !== undefined) return sum + toNumber(sale.received)
      return sum + (sale.paymentMode === 'cash' ? toNumber(sale.total) : 0)
    }, 0)
    return {
      total,
      received,
      balance: Math.max(0, total - received),
    }
  }, [salesRows])

  const dayBookTransactions = useMemo(() => {
    const sales = store.sales.filter(s => s.date.startsWith(selectedDate))
    const purchases = store.purchases.filter(p => p.date.startsWith(selectedDate))
    const expenses = store.expenses.filter(e => e.date.startsWith(selectedDate))

    return [
      ...sales.map(s => ({
        id: `s-${s.id}`,
        date: s.date,
        type: 'Sale',
        description: `Sale (${store.getCustomer(s.customerId)?.name || 'Unknown'})`,
        debit: toNumber(s.total),
        credit: 0,
      })),
      ...purchases.map(p => ({
        id: `p-${p.id}`,
        date: p.date,
        type: 'Purchase',
        description: `Purchase (${store.getCustomer(p.supplierId)?.name || 'Supplier'})`,
        debit: 0,
        credit: toNumber(p.total),
      })),
      ...expenses.map(e => ({
        id: `e-${e.id}`,
        date: e.date,
        type: 'Expense',
        description: e.description,
        debit: 0,
        credit: toNumber(e.amount),
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [store.sales, store.purchases, store.expenses, store.customers, selectedDate])

  const summary = useMemo(() => {
    const totalSales = store.sales.reduce((sum, sale) => sum + toNumber(sale.total), 0)
    const totalPurchases = store.purchases.reduce((sum, purchase) => sum + toNumber(purchase.total), 0)
    const totalExpenses = store.expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0)
    const inventoryValue = store.products.reduce(
      (sum, product) => sum + toNumber(product.price) * toNumber(product.stock),
      0
    )

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      inventoryValue,
      netProfit: totalSales - totalPurchases - totalExpenses,
    }
  }, [store.products, store.sales, store.purchases, store.expenses])

  const balanceSheet = useMemo(() => {
    const stockValue = store.products.reduce((sum, p) => sum + toNumber(p.price) * toNumber(p.stock), 0)
    const totalReceivables = store.customers.reduce((sum, c) => sum + Math.max(0, toNumber(c.balance)), 0)
    const totalPayables = store.customers.reduce((sum, c) => sum + Math.max(0, -toNumber(c.balance)), 0)

    return {
      assets: [
        { name: 'Stock-in-Hand', amount: stockValue },
        { name: 'Receivables (Debtors)', amount: totalReceivables },
      ],
      liabilities: [{ name: 'Payables (Creditors)', amount: totalPayables }],
      equity: [{ name: 'Net Profit / (Loss)', amount: summary.netProfit }],
    }
  }, [store.products, store.customers, summary.netProfit])

  function exportSalesCsv() {
    const rows = [
      ['Date', 'Invoice no', 'Party Name', 'Transaction', 'Payment Type', 'Amount', 'Balance'],
      ...salesRows.map(sale => {
        const party = store.getCustomer(sale.customerId)
        const received = sale.received !== undefined ? toNumber(sale.received) : toNumber(sale.total)
        return [
          formatDate(sale.date),
          sale.id,
          party?.name || 'Unknown',
          'Sale',
          sale.paymentMode || 'Cash',
          toNumber(sale.total),
          Math.max(0, toNumber(sale.total) - received),
        ]
      }),
    ]
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sale-invoices.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Search Transactions"
              />
            </div>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="px-3 py-2 border rounded text-sm font-semibold"
            >
              <option value="sales">Sale Invoices</option>
              <option value="daybook">Day Book</option>
              <option value="balance">Balance Sheet</option>
              <option value="summary">Summary</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/sale/new"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Sale
            </Link>
            <Link
              to="/purchase/new"
              className="inline-flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Purchase
            </Link>
            <button className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-sky-50 text-sky-700">
              <Plus className="w-4 h-4" />
            </button>
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {reportType === 'sales' && (
          <>
            <div className="px-4 py-4 border-b bg-slate-50 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Filter by :</span>
              <select className="px-3 py-2 rounded-full bg-sky-50 text-sm border border-sky-100">
                <option>This Month</option>
              </select>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-sky-50 text-sm border border-sky-100">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="bg-transparent outline-none"
                />
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="bg-transparent outline-none"
                />
              </div>
              <select className="px-3 py-2 rounded-full bg-sky-50 text-sm border border-sky-100">
                <option>All Firms</option>
              </select>
              <select className="px-3 py-2 rounded-full bg-sky-50 text-sm border border-sky-100">
                <option>All Users</option>
              </select>
            </div>

            <div className="p-4 border-b">
              <div className="w-full sm:w-80 rounded border border-purple-100 bg-purple-50/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Total Sales Amount</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{formatMoney(salesSummary.total)}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-1">
                    100%
                  </span>
                </div>
                <div className="flex gap-4 text-sm mt-4 text-purple-700">
                  <span>Received: <b>{formatMoney(salesSummary.received)}</b></span>
                  <span>Balance: <b>{formatMoney(salesSummary.balance)}</b></span>
                </div>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Transactions</h3>
                <div className="flex items-center gap-4 text-gray-500">
                  <Search className="w-5 h-5" />
                  <BarChart3 className="w-5 h-5" />
                  <button onClick={exportSalesCsv} title="Export CSV">
                    <Download className="w-5 h-5 text-emerald-600" />
                  </button>
                  <Printer className="w-5 h-5" />
                  <Settings className="w-5 h-5" />
                </div>
              </div>

              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600">
                      {['Date', 'Invoice no', 'Party Name', 'Transaction', 'Payment Type', 'Amount', 'Balance', 'Actions'].map(label => (
                        <th key={label} className="px-3 py-3 text-left font-semibold">
                          <span className="inline-flex items-center gap-2">
                            {label}
                            {!['Actions'].includes(label) && <Filter className="w-3 h-3 text-gray-400" />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salesRows.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          No sale invoices found.
                        </td>
                      </tr>
                    ) : (
                      salesRows.map(sale => {
                        const party = store.getCustomer(sale.customerId)
                        const received = sale.received !== undefined ? toNumber(sale.received) : toNumber(sale.total)
                        const balance = Math.max(0, toNumber(sale.total) - received)
                        return (
                          <tr key={sale.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-3">{formatDate(sale.date)}</td>
                            <td className="px-3 py-3 text-right">{sale.id}</td>
                            <td className="px-3 py-3">{party?.name || 'Unknown'}</td>
                            <td className="px-3 py-3 font-semibold">Sale</td>
                            <td className="px-3 py-3">{sale.paymentMode || 'Cash'}</td>
                            <td className="px-3 py-3 text-right font-semibold">{formatMoney(sale.total)}</td>
                            <td className="px-3 py-3 text-right">{formatMoney(balance)}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3 text-gray-500">
                                <Printer className="w-4 h-4" />
                                <Send className="w-4 h-4" />
                                <MoreVertical className="w-4 h-4" />
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {reportType === 'daybook' && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-sky-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-sm text-gray-600">{dayBookTransactions.length} transaction(s)</span>
          </div>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {dayBookTransactions.map(txn => (
                  <tr key={txn.id} className="border-b">
                    <td className="px-4 py-3">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3">{txn.description}</td>
                    <td className="px-4 py-3">{txn.type}</td>
                    <td className="px-4 py-3 text-right">{txn.debit ? formatMoney(txn.debit) : '-'}</td>
                    <td className="px-4 py-3 text-right">{txn.credit ? formatMoney(txn.credit) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'balance' && <BalanceSheet data={balanceSheet} />}

      {reportType === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['Total Sales', summary.totalSales],
            ['Total Purchases', summary.totalPurchases],
            ['Total Expenses', summary.totalExpenses],
            ['Inventory Value', summary.inventoryValue],
            ['Net Profit', summary.netProfit],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border rounded-lg p-5">
              <p className="text-xs text-gray-500 font-semibold">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{formatMoney(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
