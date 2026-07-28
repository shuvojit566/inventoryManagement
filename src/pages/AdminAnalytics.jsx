import React from 'react'
import { BarChart3, TrendingUp, Users, Building2, Package } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'

const analyticsCards = [
  {
    icon: TrendingUp,
    title: 'Sales Growth',
    description: 'Track revenue momentum across platform sales and purchases.',
    color: 'bg-cyan-50',
    accent: 'text-cyan-600',
  },
  {
    icon: Users,
    title: 'Customer Activity',
    description: 'Monitor active customer engagement and new registrations.',
    color: 'bg-emerald-50',
    accent: 'text-emerald-600',
  },
  {
    icon: Package,
    title: 'Product Performance',
    description: 'Review top-selling products and inventory turnover.',
    color: 'bg-purple-50',
    accent: 'text-purple-600',
  },
  {
    icon: Building2,
    title: 'Business Insights',
    description: 'Understand business activity and platform adoption over time.',
    color: 'bg-orange-50',
    accent: 'text-orange-600',
  },
]

export default function AdminAnalytics() {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6 overflow-auto flex-1 bg-slate-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">View platform analytics and performance trends.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {analyticsCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                      <p className="text-sm text-slate-600 mt-2">{card.description}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${card.accent}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Sales Trend</h2>
              <p className="text-sm text-slate-600">
                Analytics pages are now available. Use this section to add charts and detailed trend reports for your admin users.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Top Metrics</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-600 block" />
                  Total transactions, customer activity, and product performance in one place.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-600 block" />
                  Add dashboards or tables to help admin teams identify trends quickly.
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Next Steps</h2>
              <p className="text-sm text-slate-600">
                Extend this page with API-driven charts and real-time indicators for deeper analytics.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
