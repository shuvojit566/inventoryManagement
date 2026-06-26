import React, { useEffect, useState } from 'react'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'
import { TrendingUp, Package, Users, DollarSign, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const store = useStore()
  const [stats, setStats] = useState({
    salesToday: 0,
    expensesToday: 0,
    receivables: 0,
    lowStockCount: 0,
  })

  useEffect(() => {
    setStats({
      salesToday: store.getTotalTodaysSales(),
      expensesToday: store.getTotalTodaysExpenses(),
      receivables: store.getTotalReceivables(),
      lowStockCount: store.getLowStockProducts(10).length,
    })
  }, [store.sales, store.expenses, store.customers, store.products])

  const todaysSales = store.getSalesToday()
  const recentTransactions = [...todaysSales].reverse().slice(0, 5)
  const formatMoney = value => `₹${toNumber(value).toFixed(2)}`

  const StatCard = ({ icon: Icon, title, value, color = 'sky' }) => (
    <div className={`bg-white border border-${color}-200 rounded-lg p-4 hover:shadow-md transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-400`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Sales Today"
          value={formatMoney(stats.salesToday)}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Expenses Today"
          value={formatMoney(stats.expensesToday)}
          color="red"
        />
        <StatCard
          icon={Users}
          title="Receivables"
          value={formatMoney(stats.receivables)}
          color="amber"
        />
        <StatCard
          icon={Package}
          title="Low Stock Items"
          value={stats.lowStockCount}
          color={stats.lowStockCount > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Inventory Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Total Products</span>
              <span className="font-bold">{store.products.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Total Value</span>
              <span className="font-bold">
                {formatMoney(store.products.reduce((sum, p) => sum + toNumber(p.price) * toNumber(p.stock), 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Today's Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Transactions</span>
              <span className="font-bold">{todaysSales.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Avg Order Value</span>
              <span className="font-bold">
                {formatMoney(todaysSales.length > 0 ? toNumber(stats.salesToday) / todaysSales.length : 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Customers</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Total Customers</span>
              <span className="font-bold">{store.customers.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>On Credit</span>
              <span className="font-bold text-amber-600">
                {store.customers.filter(c => toNumber(c.balance) > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Low Stock Alert</h3>
            <p className="text-xs text-red-800 mt-1">
              {stats.lowStockCount} product(s) are running low on stock. Consider reordering.
            </p>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Today's Transactions</h3>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No transactions today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Time</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Mode</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((sale, idx) => {
                  const customer = store.getCustomer(sale.customerId)
                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {new Date(sale.date).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 font-medium">{customer?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            sale.paymentMode === 'cash'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {sale.paymentMode === 'cash' ? 'Cash' : 'Credit'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{formatMoney(sale.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

