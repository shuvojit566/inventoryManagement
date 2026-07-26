import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Power, Trash2, Key } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import useStore from '../store/useStore'

export default function AdminUserDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const getUserDetails = useStore(state => state.getUserDetailsAdmin)
  const updateUserStatus = useStore(state => state.updateUserStatusAdmin)
  const resetUserPassword = useStore(state => state.resetUserPasswordAdmin)
  const deleteUser = useStore(state => state.deleteUserAdmin)
  const loading = useStore(state => state.loading)

  const [user, setUser] = useState(null)
  const [tempPassword, setTempPassword] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadUserDetails()
  }, [userId])

  const loadUserDetails = async () => {
    try {
      const data = await getUserDetails(userId)
      setUser(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleStatus = async () => {
    setError(null)
    setSuccess(null)
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      await updateUserStatus(userId, newStatus)
      setSuccess(`User has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`)
      loadUserDetails()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleResetPassword = async () => {
    setError(null)
    setSuccess(null)
    try {
      const result = await resetUserPassword(userId)
      setTempPassword(result.tempPassword)
      setSuccess('Password has been reset. Temporary password shown below.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete ${user?.fullName}'s account? This action cannot be undone and will delete all associated data.`)) {
      setError(null)
      setSuccess(null)
      try {
        await deleteUser(userId)
        setSuccess('User deleted successfully. Redirecting...')
        setTimeout(() => navigate('/admin/users'), 2000)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="p-6 flex items-center justify-center flex-1">
            <p className="text-slate-500">Loading user details...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="p-6 flex items-center justify-center flex-1">
            <p className="text-red-600">User not found</p>
          </main>
        </div>
      </div>
    )
  }

  const stats = user.statistics || {}

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6 overflow-auto flex-1 bg-slate-50">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user.fullName}</h1>
              <p className="text-slate-600">{user.businessName}</p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                user.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">User ID</p>
                    <p className="text-base font-mono text-slate-900">{user.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="text-base text-slate-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Mobile Number</p>
                      <p className="text-base text-slate-900">{user.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Registered On</p>
                    <p className="text-base text-slate-900">{new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Last Login</p>
                    <p className="text-base text-slate-900">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Business Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Business Name</p>
                      <p className="text-base text-slate-900">{user.businessName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">GST Number</p>
                    <p className="text-base text-slate-900">{user.gstNumber || 'Not provided'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Business Address</p>
                      <p className="text-base text-slate-900">{user.businessAddress || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Business Type</p>
                    <p className="text-base text-slate-900">{user.businessType || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Business Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Products</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Customers</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Sales</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalSales || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Purchases</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalPurchases || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">Sales Amount</span>
                    <span className="text-lg font-bold text-slate-900">₹{(stats.totalSalesAmount || 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Password Reset */}
              {tempPassword && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">Temporary Password</h3>
                  <p className="text-2xl font-mono text-blue-900 mb-3">{tempPassword}</p>
                  <p className="text-xs text-blue-700">Share this with the user to reset their password.</p>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Account Actions</h3>
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Power className="w-4 h-4" />
                  {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Key className="w-4 h-4" />
                  Reset Password
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
