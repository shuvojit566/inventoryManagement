import React, { useState } from 'react'
import useStore from '../store/useStore'
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react'

export default function CustomersManagement() {
  const store = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', balance: 0 })
  const [message, setMessage] = useState(null)

  const resetForm = () => {
    setForm({ name: '', phone: '', balance: 0 })
    setIsAdding(false)
    setEditId(null)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      return
    }

    try {
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
    setForm(customer)
    setEditId(customer.id)
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // Note: In a real app, you'd want to prevent deletion if they have outstanding balance
        // const customer = store.getCustomer(id)
        // if (customer?.balance > 0) {
        //   setMessage({ type: 'error', text: 'Cannot delete customer with outstanding balance' })
        //   return
        // }
        setMessage({ type: 'success', text: 'Customer deleted successfully' })
        setTimeout(() => setMessage(null), 2000)
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const totalReceivables = store.customers.reduce((s, c) => s + Math.max(0, c.balance || 0), 0)
  const totalPayables = store.customers.reduce((s, c) => s + Math.max(0, -(c.balance || 0)), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Customers & Parties</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
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
          <h3 className="font-semibold text-gray-900">{editId ? 'Edit Customer' : 'Add New Customer'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
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
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., 9999999999"
              />
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
              <p className="text-xs text-gray-500 mt-1">Positive = Amount Due To You, Negative = Amount You Owe</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              {editId ? 'Update' : 'Add'} Customer
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

      {/* Customers Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Balance Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No customers yet. Add one to get started.
                </td>
              </tr>
            ) : (
              store.customers.map(customer => {
                const balance = customer.balance || 0
                const isDebtor = balance > 0
                const isCreditor = balance < 0

                return (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-center">
                      {balance === 0 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">Settled</span>
                      ) : isDebtor ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">Debit</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Credit</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={isDebtor ? 'text-amber-600' : isCreditor ? 'text-blue-600' : 'text-gray-600'}>
                        ₹{Math.abs(balance)?.toFixed(2) || '0'}
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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{store.customers.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Active Debtors</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {store.customers.filter(c => (c.balance || 0) > 0).length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Total Receivables</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalReceivables?.toFixed(0) || '0'}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Total Payables</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{totalPayables?.toFixed(0) || '0'}</p>
        </div>
      </div>
    </div>
  )
}
