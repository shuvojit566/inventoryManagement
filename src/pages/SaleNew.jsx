import React, { useState, useEffect } from 'react'
import DynamicItemTable from '../components/DynamicItemTable'
import { toNumber, fromCents } from '../utils/math'
import useStore from '../store/useStore'
import { AlertCircle, Check } from 'lucide-react'

export default function SaleNew() {
  const [taxInclusive, setTaxInclusive] = useState(false)
  const [roundOff, setRoundOff] = useState(true)
  const [subtotalC, setSubtotalC] = useState(0)
  const [paymentMode, setPaymentMode] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const store = useStore()

  const finalTotal = (() => {
    if (roundOff) return Math.round(subtotalC / 100) * 100
    return subtotalC
  })()

  async function onSave() {
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one item' })
      return
    }

    if (paymentMode === 'credit' && !selectedCustomer) {
      setMessage({ type: 'error', text: 'Please select a customer for credit sale' })
      return
    }

    setLoading(true)
    try {
      // Check stock availability if setting is enabled
      if (store.settings.stopOnNegativeStock) {
        for (const item of items) {
          const product = store.getProduct(item.productId)
          if (product && product.stock < item.qty) {
            setMessage({
              type: 'error',
              text: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
            })
            setLoading(false)
            return
          }
        }
      }

      const sale = {
        date: new Date().toISOString(),
        customerId: selectedCustomer || 'c1',
        items: items.map(item => ({
          productId: item.productId,
          qty: toNumber(item.qty),
          price: toNumber(item.price),
          discount: toNumber(item.discount),
          tax: toNumber(item.tax),
          amount: toNumber(item.amount),
        })),
        total: toNumber(fromCents(finalTotal)),
        paymentMode,
        taxMode: taxInclusive ? 'inclusive' : 'exclusive',
      }

      await store.addSale(sale)
      setMessage({
        type: 'success',
        text: `Sale saved successfully! Invoice: INV-${Date.now() % 100000}`,
      })

      // Reset form
      setTimeout(() => {
        setItems([])
        setSubtotalC(0)
        setSelectedCustomer('')
        setPaymentMode('cash')
        setMessage(null)
      }, 2000)
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleItemsChange = (newItems) => {
    setItems(newItems)
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Invoice No</label>
            <div className="text-lg font-bold text-sky-600 mt-1">INV-{Date.now() % 100000}</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Payment Mode</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {paymentMode === 'credit' && (
            <div>
              <label className="text-xs font-semibold text-gray-600">Customer</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
              >
                <option value="">Select Customer</option>
                {store.customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Bal: ₹{toNumber(c.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600">Tax Mode</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={taxInclusive ? 'inclusive' : 'exclusive'}
              onChange={e => setTaxInclusive(e.target.value === 'inclusive')}
            >
              <option value="exclusive">Tax Exclusive</option>
              <option value="inclusive">Tax Inclusive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Items Table */}
      <DynamicItemTable
        initialRows={items}
        taxInclusive={taxInclusive}
        onChangeTotal={setSubtotalC}
        onItemsChange={handleItemsChange}
        products={store.products}
      />

      {/* Summary & Save */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border rounded-lg p-4 flex justify-between items-center gap-4">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-gray-600 font-medium">Subtotal</p>
            <p className="text-lg font-bold text-gray-700">₹{fromCents(subtotalC)}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="roundoff"
              checked={roundOff}
              onChange={e => setRoundOff(e.target.checked)}
              className="w-4 h-4 accent-sky-600"
            />
            <label htmlFor="roundoff" className="text-gray-700">
              Round Off
            </label>
          </div>

          {roundOff && subtotalC % 100 !== 0 && (
            <div className="text-xs text-gray-500">
              (Rounding: -{fromCents(subtotalC % 100)})
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-600 font-medium">Final Total</p>
            <p className="text-2xl font-bold text-sky-600">₹{fromCents(finalTotal)}</p>
          </div>
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium transition"
          >
            {loading ? 'Saving...' : 'Save Sale'}
          </button>
        </div>
      </div>

      {/* Low Stock Warning */}
      {store.getLowStockProducts(10).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900">⚠️ Low Stock Items</p>
          <div className="text-xs text-amber-800 mt-1 grid grid-cols-2 gap-2">
            {store.getLowStockProducts(10).map(p => (
              <div key={p.id}>{p.name}: {p.stock} units</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

