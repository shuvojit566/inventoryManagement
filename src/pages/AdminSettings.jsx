import React from 'react'
import { Settings } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'

export default function AdminSettings() {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6 overflow-auto flex-1 bg-slate-50">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">System administration settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">System Status</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                    <option>Active</option>
                    <option>Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Users</label>
                  <input
                    type="number"
                    value="1000"
                    disabled
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
                <button className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium">
                  Save Settings
                </button>
              </div>
            </div>

            {/* Database Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Database Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Database Status</span>
                  <span className="text-sm font-medium text-emerald-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Server</span>
                  <span className="text-sm font-medium text-slate-900">JSON Server</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Data Backup</span>
                  <span className="text-sm font-medium text-slate-900">Daily</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About Admin Portal</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Platform:</strong> Inventory Management System</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p className="mt-4">
                The Admin Portal provides comprehensive management capabilities for the Inventory Management System. 
                Use this interface to manage users, view system statistics, and configure platform settings.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
