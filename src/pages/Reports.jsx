import React, { useState, useMemo, useEffect } from 'react'
import BalanceSheet from '../components/BalanceSheet'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function Reports() {
  const store = useStore()
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState('daybook')
  const formatMoney = value => `₹${toNumber(value).toFixed(2)}`

  // Get today's transactions
  const dayBookTransactions = useMemo(() => {
    const sales = store.sales.filter(s => s.date.startsWith(selectedDate))
    const purchases = store.purchases.filter(p => p.date.startsWith(selectedDate))
    const expenses = store.expenses.filter(e => e.date.startsWith(selectedDate))

    const allTxns = [
      ...sales.map(s => ({
        id: `s-${s.id}`,
        date: s.date,
        type: 'sale',
        description: `Sale (${store.getCustomer(s.customerId)?.name || 'Unknown'})`,
        debit: toNumber(s.total),
        credit: 0,
        amount: toNumber(s.total),
      })),
      ...purchases.map(p => ({
        id: `p-${p.id}`,
        date: p.date,
        type: 'purchase',
        description: `Purchase (${store.getCustomer(p.supplierId)?.name || 'Supplier'})`,
        debit: 0,
        credit: toNumber(p.total),
        amount: toNumber(p.total),
      })),
      ...expenses.map(e => ({
        id: `e-${e.id}`,
        date: e.date,
        type: 'expense',
        description: e.description,
        debit: 0,
        credit: toNumber(e.amount),
        amount: toNumber(e.amount),
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    return allTxns
  }, [store.sales, store.purchases, store.expenses, selectedDate])

  const summary = useMemo(() => {
    const totalSales = store.sales.reduce((sum, sale) => sum + toNumber(sale.total), 0)
    const totalPurchases = store.purchases.reduce((sum, purchase) => sum + toNumber(purchase.total), 0)
    const totalExpenses = store.expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0)
    const inventoryValue = store.products.reduce(
      (sum, product) => sum + toNumber(product.price) * toNumber(product.stock),
      0
    )
    const totalUnits = store.products.reduce((sum, product) => sum + toNumber(product.stock), 0)
    const totalReceivables = store.customers.reduce(
      (sum, customer) => sum + Math.max(0, toNumber(customer.balance)),
      0
    )
    const netProfit = totalSales - totalPurchases - totalExpenses
    const averageSale = store.sales.length > 0 ? totalSales / store.sales.length : 0

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      inventoryValue,
      totalUnits,
      totalReceivables,
      netProfit,
      averageSale,
    }
  }, [store.products, store.customers, store.sales, store.purchases, store.expenses])

  // Calculate balance sheet
  const balanceSheet = useMemo(() => {
    // Assets
    const stockValue = store.products.reduce((sum, p) => sum + toNumber(p.price) * toNumber(p.stock), 0)

    // Liabilities & Equity
    const totalReceivables = store.customers.reduce((sum, c) => sum + Math.max(0, toNumber(c.balance)), 0)
    const totalPayables = store.customers.reduce((sum, c) => sum + Math.max(0, -toNumber(c.balance)), 0)

    const totalSales = store.sales.reduce((sum, s) => sum + toNumber(s.total), 0)
    const totalPurchases = store.purchases.reduce((sum, p) => sum + toNumber(p.total), 0)
    const totalExpenses = store.expenses.reduce((sum, e) => sum + toNumber(e.amount), 0)
    const netProfit = totalSales - totalPurchases - totalExpenses

    return {
      assets: [
        { name: 'Stock-in-Hand', amount: stockValue },
        { name: 'Receivables (Debtors)', amount: totalReceivables },
      ],
      liabilities: [
        { name: 'Payables (Creditors)', amount: totalPayables },
      ],
      equity: [{ name: 'Net Profit / (Loss)', amount: netProfit }],
    }
  }, [store.products, store.customers, store.sales, store.purchases, store.expenses])

  const dayBookTotals = useMemo(() => {
    return {
      totalDebit: dayBookTransactions.reduce((s, t) => s + toNumber(t.debit), 0),
      totalCredit: dayBookTransactions.reduce((s, t) => s + toNumber(t.credit), 0),
    }
  }, [dayBookTransactions])

  const handleExport = () => {
    const data = dayBookTransactions.map(t => ({
      Date: new Date(t.date).toLocaleString(),
      Type: t.type.toUpperCase(),
      Description: t.description,
      Debit: t.debit,
      Credit: t.credit,
    }))

    const csv = [
      ['Date', 'Type', 'Description', 'Debit', 'Credit'],
      ...data.map(d => [d.Date, d.Type, d.Description, d.Debit, d.Credit]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daybook-${selectedDate}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Tab Selection */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setReportType('daybook')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            reportType === 'daybook'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Day Book
        </button>
        <button
          onClick={() => setReportType('balance')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            reportType === 'balance'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setReportType('summary')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            reportType === 'summary'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Summary
        </button>
      </div>

      {/* Day Book Report */}
      {reportType === 'daybook' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-sky-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-sm text-gray-600">
                {dayBookTransactions.length} transaction(s)
              </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded text-sm hover:bg-sky-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {dayBookTransactions.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              <p>No transactions for {selectedDate}</p>
            </div>
          ) : (
            <>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Debit</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayBookTransactions.map((txn, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {new Date(txn.date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{txn.description}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.type === 'sale'
                                ? 'bg-green-100 text-green-700'
                                : txn.type === 'purchase'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {txn.type === 'sale' ? 'SALE' : txn.type === 'purchase' ? 'PURCHASE' : 'EXPENSE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {toNumber(txn.debit) > 0
                          ? formatMoney(txn.debit)
                          : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                           {toNumber(txn.credit) > 0
                             ? formatMoney(txn.credit)
                             : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-gray-50 border-t px-4 py-3 flex justify-end gap-8 font-bold">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Total Debit: {formatMoney(dayBookTotals.totalDebit)}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Total Credit: {formatMoney(dayBookTotals.totalCredit)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Balance Sheet */}
      {reportType === 'balance' && (
        <div className="space-y-4">
          <BalanceSheet data={balanceSheet} />
        </div>
      )}

      {/* Summary Report */}
      {reportType === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-bold">{formatMoney(summary.totalSales)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Purchases</span>
                <span className="font-bold">{formatMoney(summary.totalPurchases)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-bold">{formatMoney(summary.totalExpenses)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600 font-semibold">Net Profit</span>
                <span
                  className={`font-bold ${
                    summary.netProfit > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatMoney(summary.netProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b">
              Inventory Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Products</span>
                <span className="font-bold">{store.products.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Units</span>
                <span className="font-bold">
                  {summary.totalUnits}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600 font-semibold">Inventory Value</span>
                <span className="font-bold">
                  {formatMoney(summary.inventoryValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b">
              Customer Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Customers</span>
                <span className="font-bold">{store.customers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">On Credit</span>
                <span className="font-bold">
                  {store.customers.filter(c => toNumber(c.balance) > 0).length}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600 font-semibold">Total Receivables</span>
                <span className="font-bold text-amber-600">
                  {formatMoney(summary.totalReceivables)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b">
              Transaction Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-bold">{store.sales.length + store.purchases.length + store.expenses.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Transaction</span>
                <span className="font-bold">
                  {formatMoney(summary.averageSale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

