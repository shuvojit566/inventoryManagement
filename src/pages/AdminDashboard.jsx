import React, { useEffect, useState } from 'react'
import { Users, Building2, Package, ShoppingCart, TrendingUp, Activity } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import useStore from '../store/useStore'

export default function AdminDashboard() {
  const getDashboardStats = useStore(state => state.getDashboardStatsAdmin)
  const loading = useStore(state => state.loading)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [getDashboardStats])

  if (!stats) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="p-6 overflow-auto flex-1">
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: Building2, label: 'Businesses', value: stats.totalBusinesses, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: Package, label: 'Products', value: stats.totalProducts, color: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Users, label: 'Customers', value: stats.totalCustomers, color: 'bg-orange-50', iconColor: 'text-orange-600' },
    { icon: ShoppingCart, label: 'Sales', value: stats.totalSales, color: 'bg-pink-50', iconColor: 'text-pink-600' },
    { icon: ShoppingCart, label: 'Purchases', value: stats.totalPurchases, color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { icon: TrendingUp, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(2)}`, color: 'bg-cyan-50', iconColor: 'text-cyan-600' },
    { icon: Activity, label: 'Active Users', value: stats.activeUsers, color: 'bg-lime-50', iconColor: 'text-lime-600' },
  ]

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6 overflow-auto flex-1 bg-slate-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Platform-wide system statistics and metrics</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{card.label}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recently Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Business</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers && stats.recentUsers.length > 0 ? (
                    stats.recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{user.fullName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{user.businessName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
