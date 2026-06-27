import React, { useState } from 'react'
import DynamicItemTable from '../components/DynamicItemTable'
import { toNumber, fromCents } from '../utils/math'
import useStore from '../store/useStore'
import { AlertCircle, Check, X } from 'lucide-react'

const emptyProductForm = {
  name: '',
  partyId: '',
  purchasePrice: '',
  sellingPrice: '',
  unit: 'pcs',
  quantity: '1',
  gst: '0',
  category: '',
  description: '',
}

const emptyPartyForm = {
  name: '',
  phone: '',
}

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
  const [productCreateRequest, setProductCreateRequest] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [productErrors, setProductErrors] = useState({})
  const [productSaving, setProductSaving] = useState(false)
  const [partyForm, setPartyForm] = useState(emptyPartyForm)
  const [showNewPartyForm, setShowNewPartyForm] = useState(false)
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
            unit: item.unit || 'pcs',
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

  function requestCreateProduct(rowIndex, typedName = '') {
    setProductForm({
      ...emptyProductForm,
      name: typedName,
      partyId: selectedSupplier,
    })
    setProductErrors({})
    setPartyForm(emptyPartyForm)
    setShowNewPartyForm(false)
    return new Promise(resolve => {
      setProductCreateRequest({ rowIndex, resolve })
    })
  }

  function closeProductCreator(result = null) {
    if (productCreateRequest?.resolve) productCreateRequest.resolve(result)
    setProductCreateRequest(null)
    setProductForm(emptyProductForm)
    setProductErrors({})
    setPartyForm(emptyPartyForm)
    setShowNewPartyForm(false)
    setProductSaving(false)
  }

  function validateProductForm() {
    const errors = {}
    const purchasePrice = Number(productForm.purchasePrice)
    const sellingPrice = Number(productForm.sellingPrice)
    const quantity = Number(productForm.quantity)
    const gst = Number(productForm.gst)
    if (!productForm.name.trim()) errors.name = 'Product name is required'
    if (!productForm.partyId && !showNewPartyForm) errors.partyId = 'Please select a party'
    if (showNewPartyForm && !partyForm.name.trim()) errors.partyName = 'Party name is required'
    if (productForm.purchasePrice === '' || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
      errors.purchasePrice = 'Purchase price is required'
    }
    if (productForm.sellingPrice === '' || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      errors.sellingPrice = 'Selling price is required'
    }
    if (productForm.quantity === '' || !Number.isFinite(quantity) || quantity <= 0) {
      errors.quantity = 'Quantity is required'
    }
    if (productForm.gst !== '' && (!Number.isFinite(gst) || gst < 0)) {
      errors.gst = 'GST cannot be negative'
    }
    setProductErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function saveAndUseProduct(e) {
    e.preventDefault()
    if (!validateProductForm()) return

    setProductSaving(true)
    try {
      let partyId = productForm.partyId
      if (showNewPartyForm) {
        const newParty = await store.addCustomer({
          name: partyForm.name.trim(),
          phone: partyForm.phone.trim(),
          balance: 0,
        })
        partyId = newParty.id
      }

      const purchasePrice = toNumber(productForm.purchasePrice)
      const sellingPrice = toNumber(productForm.sellingPrice)
      const purchaseQty = toNumber(productForm.quantity)
      const newProduct = await store.addProduct({
        name: productForm.name.trim(),
        purchasePrice,
        sellingPrice,
        price: sellingPrice,
        unit: productForm.unit.trim() || 'pcs',
        gst: toNumber(productForm.gst),
        category: productForm.category.trim(),
        description: productForm.description.trim(),
        stock: 0,
      })
      await store.refreshProducts().catch(() => null)
      setSelectedSupplier(partyId)
      setMessage({ type: 'success', text: `${newProduct.name} added and selected in the purchase row` })
      setTimeout(() => setMessage(null), 2500)
      closeProductCreator({ ...newProduct, purchaseQty })
    } catch (err) {
      setProductErrors({ submit: err.message || 'Could not save product' })
      setMessage({ type: 'error', text: `Product save failed: ${err.message}` })
    } finally {
      setProductSaving(false)
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
        priceMode="purchase"
        onRequestCreateProduct={requestCreateProduct}
        creatingProduct={productSaving}
      />

      {productCreateRequest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <form
            onSubmit={saveAndUseProduct}
            className="w-full max-w-2xl bg-white rounded-lg shadow-xl border"
          >
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">New Product</h3>
                <p className="text-xs text-gray-500 mt-1">
                  It will be selected in row {productCreateRequest.rowIndex + 1} after saving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeProductCreator(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.name ? 'border-red-300' : ''
                  }`}
                  autoFocus
                />
                {productErrors.name && <p className="text-xs text-red-600 mt-1">{productErrors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Party *</label>
                <select
                  value={showNewPartyForm ? '__new__' : productForm.partyId}
                  onChange={e => {
                    if (e.target.value === '__new__') {
                      setShowNewPartyForm(true)
                      setProductForm({ ...productForm, partyId: '' })
                      return
                    }
                    setShowNewPartyForm(false)
                    setProductForm({ ...productForm, partyId: e.target.value })
                  }}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.partyId ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select Party</option>
                  {store.customers.map(party => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                  <option value="__new__">+ New Party</option>
                </select>
                {productErrors.partyId && <p className="text-xs text-red-600 mt-1">{productErrors.partyId}</p>}
              </div>

              {showNewPartyForm && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded border border-sky-100 bg-sky-50 p-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
                    <input
                      type="text"
                      value={partyForm.name}
                      onChange={e => setPartyForm({ ...partyForm, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        productErrors.partyName ? 'border-red-300' : ''
                      }`}
                      placeholder="Supplier or vendor name"
                    />
                    {productErrors.partyName && <p className="text-xs text-red-600 mt-1">{productErrors.partyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={partyForm.phone}
                      onChange={e => setPartyForm({ ...partyForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                <input
                  type="number"
                  value={productForm.purchasePrice}
                  onChange={e => setProductForm({ ...productForm, purchasePrice: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.purchasePrice ? 'border-red-300' : ''
                  }`}
                  min="0"
                  step="0.01"
                />
                {productErrors.purchasePrice && <p className="text-xs text-red-600 mt-1">{productErrors.purchasePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                <input
                  type="number"
                  value={productForm.sellingPrice}
                  onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.sellingPrice ? 'border-red-300' : ''
                  }`}
                  min="0"
                  step="0.01"
                />
                {productErrors.sellingPrice && <p className="text-xs text-red-600 mt-1">{productErrors.sellingPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={productForm.unit}
                  onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pcs">pcs</option>
                  <option value="grams">grams</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={productForm.quantity}
                  onChange={e => setProductForm({ ...productForm, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.quantity ? 'border-red-300' : ''
                  }`}
                  min="0.01"
                  step="0.01"
                />
                {productErrors.quantity && <p className="text-xs text-red-600 mt-1">{productErrors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                <input
                  type="number"
                  value={productForm.gst}
                  onChange={e => setProductForm({ ...productForm, gst: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    productErrors.gst ? 'border-red-300' : ''
                  }`}
                  min="0"
                  step="0.01"
                />
                {productErrors.gst && <p className="text-xs text-red-600 mt-1">{productErrors.gst}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]"
                />
              </div>

              {productErrors.submit && (
                <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
                  {productErrors.submit}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeProductCreator(null)}
                disabled={productSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-white disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={productSaving}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded font-medium"
              >
                {productSaving ? 'Saving Product...' : 'Save & Use Product'}
              </button>
            </div>
          </form>
        </div>
      )}

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
