import React, { useState } from 'react'
import useStore from '../store/useStore'
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react'

export default function ProductsManagement() {
  const store = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', hsn: '', price: 0, stock: 0 })
  const [message, setMessage] = useState(null)

  const resetForm = () => {
    setForm({ name: '', hsn: '', price: 0, stock: 0 })
    setIsAdding(false)
    setEditId(null)
  }

  const handleSubmit = async () => {
    if (!form.name || form.price < 0 || form.stock < 0) {
      setMessage({ type: 'error', text: 'Please fill all fields correctly' })
      return
    }

    try {
      if (editId) {
        await store.updateProduct(editId, form)
        setMessage({ type: 'success', text: 'Product updated successfully' })
      } else {
        await store.addProduct(form)
        setMessage({ type: 'success', text: 'Product added successfully' })
      }
      resetForm()
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleEdit = (product) => {
    setForm(product)
    setEditId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await store.deleteProduct(id)
        setMessage({ type: 'success', text: 'Product deleted successfully' })
        setTimeout(() => setMessage(null), 2000)
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Products & Inventory</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Add Product
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
          <h3 className="font-semibold text-gray-900">{editId ? 'Edit Product' : 'Add New Product'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., Widget A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
              <input
                type="text"
                value={form.hsn}
                onChange={e => setForm({ ...form, hsn: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., 1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              {editId ? 'Update' : 'Add'} Product
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

      {/* Products Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">HSN</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Stock</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Value</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No products yet. Add one to get started.
                </td>
              </tr>
            ) : (
              store.products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.hsn}</td>
                  <td className="px-4 py-3 text-right">₹{product.price?.toFixed(2) || '0'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock > 20
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 10
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ₹{(product.price * product.stock)?.toFixed(2) || '0'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{store.products.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Total Units</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {store.products.reduce((s, p) => s + p.stock, 0)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{store.products.reduce((s, p) => s + p.price * p.stock, 0)?.toFixed(0) || '0'}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {store.getLowStockProducts(10).length}
          </p>
        </div>
      </div>
    </div>
  )
}
