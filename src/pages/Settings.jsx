import React, { useEffect, useState } from 'react'
import SettingsPanel from '../components/SettingsPanel'
import DeleteAccountModal from '../components/DeleteAccountModal'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'
import { Settings as SettingsIcon, Package, Users, DollarSign, Trash2 } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [managerForm, setManagerForm] = useState({ fullName: '', email: '', temporaryPassword: '' })
  const [managerFeedback, setManagerFeedback] = useState({ type: '', message: '' })
  const [isCreatingManager, setIsCreatingManager] = useState(false)
  const [managers, setManagers] = useState([])
  const store = useStore()
  const isOwner = store.currentUser?.role === 'OWNER'

  const userData = {
    products: store.products.length,
    customers: store.customers.length,
    sales: store.sales.length,
    purchases: store.purchases.length,
    expenses: store.expenses.length,
  }

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

  const handleCreateManager = async event => {
    event.preventDefault()
    if (!managerForm.fullName || !managerForm.email || !managerForm.temporaryPassword) {
      setManagerFeedback({ type: 'error', message: 'Please fill in all fields.' })
      return
    }

    try {
      setIsCreatingManager(true)
      setManagerFeedback({ type: '', message: '' })
      await store.createManager(managerForm)
      setManagerFeedback({ type: 'success', message: 'Manager account created successfully.' })
      setManagerForm({ fullName: '', email: '', temporaryPassword: '' })
      await loadManagers()
    } catch (error) {
      setManagerFeedback({ type: 'error', message: error.message || 'Failed to create manager account.' })
    } finally {
      setIsCreatingManager(false)
    }
  }

  const loadManagers = async () => {
    if (!store.currentUser?.id) return
    try {
      const sessionRaw = window.localStorage.getItem('inventory-session') || window.sessionStorage.getItem('inventory-session')
      const session = sessionRaw ? JSON.parse(sessionRaw) : null
      const userId = session?.id || session?.userId || store.currentUser.id

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/users?role=MANAGER`, {
        headers: {
          Authorization: `Bearer ${userId}`,
          'X-User-Id': userId,
        },
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setManagers(data.filter(manager => (manager.managedOwnerId || manager.createdBy) === store.currentUser.id))
      }
    } catch (error) {
      console.error('Failed to load managers', error)
    }
  }

  useEffect(() => {
    if (isOwner) {
      loadManagers()
    }
  }, [isOwner, store.currentUser?.id])

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b bg-white rounded-t-lg -m-4 mb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <SettingsIcon className="w-4 h-4 inline mr-2" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'manage'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Manage Data
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Account
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
            description={`Currently managing ${store.products.length} products with ${store.products.reduce((s, p) => s + toNumber(p.stock), 0)} total units in stock`}
            actionText="Manage"
            action={() => alert('Product management coming soon!')}
          />
          <ManagementCard
            icon={Users}
            title="Customers"
            description={`${store.customers.length} customers in database. ${store.customers.filter(c => toNumber(c.balance) > 0).length} have outstanding credits`}
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

      {/* Account */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          {/* Account Information */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900">{store.currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-900">{store.currentUser?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Business Name</span>
                <span className="font-medium text-gray-900">{store.currentUser?.businessName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Created</span>
                <span className="font-medium text-gray-900">
                  {store.currentUser?.createdAt ? new Date(store.currentUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Manage Staff / Managers</h3>
              <p className="text-xs text-gray-600 mb-4">
                Create a manager account for your team. Managers can access sales, purchases, inventory, and dashboard workflows, but they cannot modify profile or account settings.
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Active Managers</h4>
                {managers.length === 0 ? (
                  <div className="text-xs text-gray-500">No managers created yet.</div>
                ) : (
                  <div className="space-y-2">
                    {managers.map(manager => (
                      <div key={manager.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{manager.fullName}</div>
                          <div className="text-xs text-gray-500">{manager.email || 'No email'} • {manager.businessName || 'Business not set'}</div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleCreateManager} className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={managerForm.fullName}
                      onChange={event => setManagerForm({ ...managerForm, fullName: event.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Manager Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={managerForm.email}
                      onChange={event => setManagerForm({ ...managerForm, email: event.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    value={managerForm.temporaryPassword}
                    onChange={event => setManagerForm({ ...managerForm, temporaryPassword: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Create a temporary password"
                  />
                </div>
                {managerFeedback.message && (
                  <div className={`rounded-lg border px-3 py-2 text-sm ${managerFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {managerFeedback.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isCreatingManager}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 rounded-lg transition"
                >
                  {isCreatingManager ? 'Creating...' : 'Create Manager'}
                </button>
              </form>
            </div>
          )}

          {/* Data Statistics */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">📊 Your Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Products</div>
                <div className="text-lg font-bold text-amber-600">{userData.products}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Customers</div>
                <div className="text-lg font-bold text-amber-600">{userData.customers}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Sales</div>
                <div className="text-lg font-bold text-amber-600">{userData.sales}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Purchases</div>
                <div className="text-lg font-bold text-amber-600">{userData.purchases}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Expenses</div>
                <div className="text-lg font-bold text-amber-600">{userData.expenses}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Businesses</div>
                <div className="text-lg font-bold text-amber-600">{store.businesses.length}</div>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">Delete Account</h3>
                <p className="text-xs text-red-700 mt-1">Permanently delete your account and all associated data</p>
              </div>
            </div>

            <div className="bg-white rounded p-3 mb-3 text-xs">
              <p className="text-gray-700 mb-2">
                <strong>⚠️ Warning:</strong> Deleting your account is <strong>permanent</strong> and <strong>cannot be undone</strong>. 
                All your data including {userData.products} products, {userData.customers} customers, 
                {userData.sales} sales, and all other business information will be permanently removed.
              </p>
            </div>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete My Account
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Before You Go</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Make sure you have backed up any important data</li>
              <li>• This action will log you out immediately</li>
              <li>• You will not be able to recover your account or data</li>
              <li>• Consider contacting support if you need help</li>
            </ul>
          </div>
        </div>
      )}

      {/* Help Section */}
      {activeTab !== 'account' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">💡 Help & Tips</h3>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Use the "Stop Sale on Negative Stock" setting to prevent overselling</li>
            <li>• Enable "Audit Trail" to track all user actions</li>
            <li>• Select a print theme that matches your invoice format</li>
            <li>• Regular backups are recommended for data safety</li>
          </ul>
        </div>
      )}

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userData={userData}
      />
    </div>
  )
}


