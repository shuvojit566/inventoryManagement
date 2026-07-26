import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Edit2, Trash2, Power } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import useStore from '../store/useStore'

export default function AdminUsers() {
  const fetchAllUsers = useStore(state => state.fetchAllUsers)
  const searchUsersAdmin = useStore(state => state.searchUsersAdmin)
  const updateUserStatus = useStore(state => state.updateUserStatusAdmin)
  const deleteUser = useStore(state => state.deleteUserAdmin)
  const loading = useStore(state => state.loading)
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [filterStatus, setFilterStatus] = useState('all')

  const itemsPerPage = 10

  useEffect(() => {
    loadUsers()
  }, [currentPage])

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers(currentPage, itemsPerPage)
      setUsers(data.users || [])
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const handleSearch = async (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.trim().length > 0) {
      try {
        const results = await searchUsersAdmin(term)
        setUsers(results || [])
        setCurrentPage(1)
      } catch (err) {
        console.error('Search failed:', err)
      }
    } else {
      loadUsers()
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await updateUserStatus(userId, newStatus)
      loadUsers()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}'s account? This action cannot be undone.`)) {
      try {
        await deleteUser(userId)
        loadUsers()
      } catch (err) {
        console.error('Failed to delete user:', err)
      }
    }
  }

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`)
  }

  const filteredUsers = users.filter(user => {
    if (filterStatus === 'all') return true
    return user.status === filterStatus
  })

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6 overflow-auto flex-1 bg-slate-50">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">View, manage, and control user accounts</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by name, email, phone, or business..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">User ID</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Business</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Phone</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-700">Registered</th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 text-sm font-mono text-slate-600">{user.id}</td>
                        <td className="py-3 px-6 text-sm font-medium text-slate-900">{user.fullName}</td>
                        <td className="py-3 px-6 text-sm text-slate-600">{user.businessName}</td>
                        <td className="py-3 px-6 text-sm text-slate-600">{user.email}</td>
                        <td className="py-3 px-6 text-sm text-slate-600">{user.phone}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(user.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className={`p-1 rounded transition-colors ${
                                user.status === 'active'
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total users)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
