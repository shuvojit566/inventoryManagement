import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Box, FileText, BarChart2, Settings as SettingsIcon } from 'lucide-react'

const sections = [
  { title: 'Dashboard', icon: Home, to: '/' },
  { title: 'Products', icon: Box, to: '/items' },
  { title: 'Customers', icon: Users, to: '/parties' },
  { title: 'New Sale', icon: FileText, to: '/sale/new' },
  { title: 'Reports', icon: BarChart2, to: '/reports' },
  { title: 'Settings', icon: SettingsIcon, to: '/settings' },
]

export default function Sidebar() {
  const loc = useLocation()
  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-gray-900">📊 GST ERP</h1>
        <p className="text-xs text-gray-500 mt-1">Inventory Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sections.map(s => {
          const Icon = s.icon
          const active = loc.pathname === s.to
          return (
            <Link
              key={s.to}
              to={s.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                active
                  ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span>{s.title}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
        <p>💡 Tip: Use keyboard shortcuts for faster navigation</p>
      </div>
    </aside>
  )
}

