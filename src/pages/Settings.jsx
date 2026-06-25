import React, { useState } from 'react'
import SettingsPanel from '../components/SettingsPanel'
import useStore from '../store/useStore'
import { Settings as SettingsIcon, Package, Users, DollarSign } from 'lucide-react'
export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const store = useStore()

  const ManagementCard = ({ icon: Icon, title, description, action, actionText, loading = false }) => (
    <div className="bg-white border rounded-lg p-4 flex items-start justify-between hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-sky-100 rounded">
          <Icon className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <button
        onClick={action}
        disabled={loading}
        className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded transition"
      >
        {loading ? 'Loading...' : actionText}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b bg-white rounded-t-lg -m-4 mb-0">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'general'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'manage'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Manage Data
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <SettingsPanel />
        </div>
      )}

      {/* Manage Data */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <ManagementCard
            icon={Package}
            title="Products"
            description={`Currently managing ${store.products.length} products with ${store.products.reduce((s, p) => s + p.stock, 0)} total units in stock`}
            actionText="Manage"
            action={() => alert('Product management coming soon!')}
          />
          <ManagementCard
            icon={Users}
            title="Customers"
            description={`${store.customers.length} customers in database. ${store.customers.filter(c => (c.balance || 0) > 0).length} have outstanding credits`}
            actionText="Manage"
            action={() => alert('Customer management coming soon!')}
          />
          <ManagementCard
            icon={DollarSign}
            title="Transactions"
            description={`Total sales: ${store.sales.length} | Total expenses: ${store.expenses.length}`}
            actionText="View"
            action={() => alert('Transaction management coming soon!')}
          />

          {/* Data Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 Data Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-gray-600">Products</div>
                <div className="text-lg font-bold text-blue-600">{store.products.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Customers</div>
                <div className="text-lg font-bold text-blue-600">{store.customers.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Sales</div>
                <div className="text-lg font-bold text-blue-600">{store.sales.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Expenses</div>
                <div className="text-lg font-bold text-blue-600">{store.expenses.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">💡 Help & Tips</h3>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• Use the "Stop Sale on Negative Stock" setting to prevent overselling</li>
          <li>• Enable "Audit Trail" to track all user actions</li>
          <li>• Select a print theme that matches your invoice format</li>
          <li>• Regular backups are recommended for data safety</li>
        </ul>
      </div>
    </div>
  )
}

