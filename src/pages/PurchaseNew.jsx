import React, { useState } from 'react'
import DynamicItemTable from '../components/DynamicItemTable'
import { toNumber, fromCents } from '../utils/math'
import useStore from '../store/useStore'
import { AlertCircle, Check } from 'lucide-react'

export default function PurchaseNew() {
  const [taxInclusive, setTaxInclusive] = useState(false)
  const [roundOff, setRoundOff] = useState(true)
  const [subtotalC, setSubtotalC] = useState(0)
  const [paymentMode, setPaymentMode] = useState('cash')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [items, setItems] = useState([])
  const [resetKey, setResetKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const store = useStore()

  const purchaseNo = `PUR-${Date.now() % 100000}`
  const finalTotal = roundOff ? Math.round(subtotalC / 100) * 100 : subtotalC

  async function onSave() {
    if (items.length === 0 || items.every(item => !item.productId)) {
      setMessage({ type: 'error', text: 'Please add at least one product' })
      return
    }

    if (paymentMode === 'credit' && !selectedSupplier) {
      setMessage({ type: 'error', text: 'Please select a supplier for credit purchase' })
      return
    }

    setLoading(true)
    try {
      const purchase = {
        date: new Date().toISOString(),
        supplierId: selectedSupplier || '',
        items: items
          .filter(item => item.productId)
          .map(item => ({
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

      await store.addPurchase(purchase)
      setMessage({
        type: 'success',
        text: `Purchase saved successfully! Bill: ${purchaseNo}`,
      })

      setTimeout(() => {
        setItems([])
        setSubtotalC(0)
        setSelectedSupplier('')
        setPaymentMode('cash')
        setResetKey(key => key + 1)
        setMessage(null)
      }, 2000)
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Purchase Bill No</label>
            <div className="text-lg font-bold text-sky-600 mt-1">{purchaseNo}</div>
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

          <div>
            <label className="text-xs font-semibold text-gray-600">Supplier</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {store.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Bal: Rs. {toNumber(c.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

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

      <DynamicItemTable
        key={resetKey}
        initialRows={items}
        taxInclusive={taxInclusive}
        onChangeTotal={setSubtotalC}
        onItemsChange={setItems}
        products={store.products}
      />

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border rounded-lg p-4 flex justify-between items-center gap-4">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-gray-600 font-medium">Subtotal</p>
            <p className="text-lg font-bold text-gray-700">Rs. {fromCents(subtotalC)}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="purchase-roundoff"
              checked={roundOff}
              onChange={e => setRoundOff(e.target.checked)}
              className="w-4 h-4 accent-sky-600"
            />
            <label htmlFor="purchase-roundoff" className="text-gray-700">
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
            <p className="text-2xl font-bold text-sky-600">Rs. {fromCents(finalTotal)}</p>
          </div>
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium transition"
          >
            {loading ? 'Saving...' : 'Save Purchase'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900">Stock will be updated after saving</p>
        <p className="text-xs text-blue-800 mt-1">
          Each saved purchase increases the selected product stock. Credit purchases add to supplier payables.
        </p>
      </div>
    </div>
  )
}
