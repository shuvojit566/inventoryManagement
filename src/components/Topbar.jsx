import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Clock } from 'lucide-react'
import useStore from '../store/useStore'

export default function Topbar() {
  const store = useStore()
  const now = new Date()

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
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

