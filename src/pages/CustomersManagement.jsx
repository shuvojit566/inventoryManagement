import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'
import { sanitizePhoneInput, isValidPhoneNumber } from '../utils/phone'
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react'

export default function CustomersManagement() {
  const store = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [partyType, setPartyType] = useState('all') // 'all', 'selling', 'purchased'
  const [form, setForm] = useState({ name: '', phone: '', balance: 0, type: 'selling' })
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState(null)

  const resetForm = () => {
    setForm({ name: '', phone: '', balance: 0, type: 'selling' })
    setFormErrors({})
    setIsAdding(false)
    setEditId(null)
  }

  // Filter customers based on party type
  const filteredCustomers = useMemo(() => {
    if (partyType === 'all') return store.customers
    return store.customers.filter(c => (c.type || 'selling') === partyType)
  }, [store.customers, partyType])

  const handleSubmit = async () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Party name is required'
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!isValidPhoneNumber(form.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setMessage({ type: 'error', text: errors.phone || 'Please fill all required fields' })
      return
    }

    try {
      setFormErrors({})
      if (editId) {
        await store.updateCustomer(editId, form)
        setMessage({ type: 'success', text: 'Customer updated successfully' })
      } else {
        await store.addCustomer(form)
        setMessage({ type: 'success', text: 'Customer added successfully' })
      }
      resetForm()
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleEdit = (customer) => {
    setForm({ ...customer, phone: sanitizePhoneInput(customer.phone || '') })
    setEditId(customer.id)
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setMessage({ type: 'success', text: 'Customer deleted successfully' })
        setTimeout(() => setMessage(null), 2000)
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const sellingCustomers = store.customers.filter(c => (c.type || 'selling') === 'selling')
  const purchasedCustomers = store.customers.filter(c => (c.type || 'selling') === 'purchased')
  
  const sellingReceivables = sellingCustomers.reduce((s, c) => s + Math.max(0, toNumber(c.balance)), 0)
  const sellingPayables = sellingCustomers.reduce((s, c) => s + Math.max(0, -toNumber(c.balance)), 0)
  
  const purchasedReceivables = purchasedCustomers.reduce((s, c) => s + Math.max(0, toNumber(c.balance)), 0)
  const purchasedPayables = purchasedCustomers.reduce((s, c) => s + Math.max(0, -toNumber(c.balance)), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Parties Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage selling customers and purchased suppliers</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Add Party
        </button>
      </div>

      {/* Party Type Filter */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Party Type</label>
        <div className="flex gap-3">
          <button
            onClick={() => setPartyType('all')}
            className={`px-4 py-2 rounded font-medium transition ${
              partyType === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Parties ({store.customers.length})
          </button>
          <button
            onClick={() => setPartyType('selling')}
            className={`px-4 py-2 rounded font-medium transition ${
              partyType === 'selling'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Selling Parties ({sellingCustomers.length})
          </button>
          <button
            onClick={() => setPartyType('purchased')}
            className={`px-4 py-2 rounded font-medium transition ${
              partyType === 'purchased'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Purchased Parties ({purchasedCustomers.length})
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}
        >
          <AlertCircle className={`w-5 h-5 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`} />
          <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{editId ? 'Edit Party' : 'Add New Party'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Type *</label>
              <select
                value={form.type || 'selling'}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="selling">Selling Party (Customer)</option>
                <option value="purchased">Purchased Party (Supplier)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., Ravi Kumar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={e => {
                  setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: null })
                }}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  formErrors.phone ? 'border-red-300' : ''
                }`}
                placeholder="e.g., 9999999999"
              />
              {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₹)</label>
              <input
                type="number"
                value={form.balance}
                onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">
                {form.type === 'selling' 
                  ? 'Positive Balance = Customer owes you money | Negative Balance = You owe customer'
                  : 'Positive Balance = You owe supplier | Negative Balance = Supplier owes you'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              {editId ? 'Update' : 'Add'} Party
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Parties Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {partyType === 'all' && 'All Parties'}
              {partyType === 'selling' && 'Selling Parties (Customers)'}
              {partyType === 'purchased' && 'Purchased Parties (Suppliers)'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Total: {filteredCustomers.length} parties
            </p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Party Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Balance Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No parties found. Add one to get started.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => {
                const balance = toNumber(customer.balance)
                const isDebtor = balance > 0
                const isCreditor = balance < 0
                const customerType = customer.type || 'selling'

                return (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        customerType === 'selling'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {customerType === 'selling' ? 'Selling' : 'Purchased'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-center">
                      {balance === 0 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">Settled</span>
                      ) : customerType === 'selling' ? (
                        isDebtor ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">You Receive</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">You Pay</span>
                        )
                      ) : (
                        isDebtor ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">You Owe</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">They Owe</span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={isDebtor ? 'text-amber-600' : isCreditor ? 'text-blue-600' : 'text-gray-600'}>
                        ₹{toNumber(Math.abs(balance)).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Selling Parties Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Selling Parties (Customers) Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sellingCustomers.length}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">You Receive</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">₹{toNumber(sellingReceivables).toFixed(0)}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">You Pay</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{toNumber(sellingPayables).toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Purchased Parties Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Purchased Parties (Suppliers) Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{purchasedCustomers.length}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">They Owe You</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">₹{toNumber(purchasedReceivables).toFixed(0)}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium">You Owe Them</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{toNumber(purchasedPayables).toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
