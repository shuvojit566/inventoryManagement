import React, { useEffect, useState } from 'react'
import DynamicItemTable from '../components/DynamicItemTable'
import BillShareModal from '../components/BillShareModal'
import { toNumber, fromCents } from '../utils/math'
import { sanitizePhoneInput, isValidPhoneNumber } from '../utils/phone'
import useStore from '../store/useStore'
import { AlertCircle, Check, Printer, Send } from 'lucide-react'
import { printBill, formatBillForShare, generateBillShareURL } from '../utils/billShare'

export default function SaleNew() {
  const [taxInclusive, setTaxInclusive] = useState(false)
  const [roundOff, setRoundOff] = useState(true)
  const [subtotalC, setSubtotalC] = useState(0)
  const [paymentMode, setPaymentMode] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [stateOfSupply, setStateOfSupply] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [mechanicCharge, setMechanicCharge] = useState(0)
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [items, setItems] = useState([])
  const [resetKey, setResetKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})
  const [lastSavedSale, setLastSavedSale] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
  })
  const [customerErrors, setCustomerErrors] = useState({})
  const [savingCustomer, setSavingCustomer] = useState(false)
  const store = useStore()
  const saleCustomers = store.customers.filter(c => (c.type || 'selling') === 'selling')

  const selectedCustomerRecord = store.getCustomer(selectedCustomer)
  const invoiceNo = `INV-${Date.now() % 100000}`
  const roundedSubtotalC = roundOff ? Math.round(subtotalC / 100) * 100 : subtotalC
  const mechanicChargeC = Math.round(toNumber(mechanicCharge) * 100)
  const finalTotalC = roundedSubtotalC + mechanicChargeC
  const finalTotal = toNumber(fromCents(finalTotalC))
  const balanceAmount = Math.max(0, finalTotal - toNumber(receivedAmount))

  useEffect(() => {
    setPhone(sanitizePhoneInput(selectedCustomerRecord?.phone || ''))
  }, [selectedCustomerRecord?.id])

  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      gst: '',
    })
    setCustomerErrors({})
  }

  const validateCustomerForm = () => {
    const errors = {}
    if (!customerForm.name.trim()) errors.name = 'Customer name is required'
    if (!customerForm.phone.trim() || !isValidPhoneNumber(customerForm.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits'
    }
    if (!customerForm.email.trim() || !isValidEmail(customerForm.email)) {
      errors.email = 'Valid email address is required'
    }
    if (!customerForm.address.trim()) errors.address = 'Address is required'
    if (!customerForm.gst.trim()) errors.gst = 'GST number is required'
    setCustomerErrors(errors)
    return Object.keys(errors).length === 0
  }

  const closeCustomerModal = () => {
    setShowCustomerModal(false)
    resetCustomerForm()
  }

  const saveCustomerAndSelect = async e => {
    e.preventDefault()
    if (!validateCustomerForm()) return

    setSavingCustomer(true)
    try {
      const newCustomer = await store.addCustomer({
        ...customerForm,
        phone: sanitizePhoneInput(customerForm.phone),
        balance: 0,
        type: 'selling',
      })
      setSelectedCustomer(newCustomer.id)
      setPhone(newCustomer.phone)
      setMessage({ type: 'success', text: 'Customer created and selected.' })
      closeCustomerModal()
    } catch (err) {
      setCustomerErrors({ submit: err.message || 'Could not save customer' })
      setMessage({ type: 'error', text: err.message || 'Could not save customer' })
    } finally {
      setSavingCustomer(false)
    }
  }

  const handlePrintLastSale = () => {
    if (lastSavedSale) {
      const formattedBill = formatBillForShare(lastSavedSale, {
        products: store.products,
        customers: store.customers,
        businesses: store.businesses,
      })
      printBill(formattedBill)
    }
  }

  const handleOpenShareModal = () => {
    setShareModalOpen(true)
  }

  const handleCloseShareModal = () => {
    setShareModalOpen(false)
  }

  const handleNewSale = () => {
    resetSaleForm()
    setLastSavedSale(null)
    setMessage(null)
  }

  function resetSaleForm() {
    setItems([])
    setSubtotalC(0)
    setSelectedCustomer('')
    setPhone('')
    setBillingAddress('')
    setStateOfSupply('')
    setMechanicCharge(0)
    setReceivedAmount(0)
    setPaymentMode('cash')
    setResetKey(key => key + 1)
    setErrors({})
  }

  async function onSave() {
    if (items.length === 0 || items.every(item => !item.productId)) {
      setMessage({ type: 'error', text: 'Please add at least one item' })
      return
    }

    if (!selectedCustomer) {
      setMessage({ type: 'error', text: 'Please select a customer' })
      return
    }

    if (!isValidPhoneNumber(phone)) {
      setErrors({ phone: 'Phone number must be exactly 10 digits' })
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' })
      return
    }

    setErrors({})
    setLoading(true)
    try {
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
        date: new Date(invoiceDate).toISOString(),
        customerId: selectedCustomer,
        phone,
        billingAddress,
        stateOfSupply,
        mechanicCharge: toNumber(mechanicCharge),
        received: toNumber(receivedAmount),
        balance: balanceAmount,
        items: items
          .filter(item => item.productId)
          .map(item => ({
            productId: item.productId,
            qty: toNumber(item.qty),
            unit: item.unit || 'pcs',
            price: toNumber(item.price),
            discount: toNumber(item.discount),
            tax: toNumber(item.tax),
            amount: toNumber(item.amount),
          })),
        total: finalTotal,
        paymentMode,
        taxMode: taxInclusive ? 'inclusive' : 'exclusive',
      }

      await store.addSale(sale)
      
      // Store the saved sale for print/share
      const savedSale = {
        ...sale,
        id: invoiceNo,
      }
      setLastSavedSale(savedSale)
      
      setMessage({ type: 'success', text: `Sale saved successfully! Invoice: ${invoiceNo}` })
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Sale</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${paymentMode === 'credit' ? 'text-sky-700' : 'text-gray-500'}`}>
              Credit
            </span>
            <button
              type="button"
              onClick={() => setPaymentMode(paymentMode === 'credit' ? 'cash' : 'credit')}
              className={`w-12 h-6 rounded-full p-1 transition ${paymentMode === 'cash' ? 'bg-sky-200' : 'bg-sky-600'}`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white shadow transition ${
                  paymentMode === 'cash' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${paymentMode === 'cash' ? 'text-gray-900' : 'text-gray-500'}`}>
              Cash
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-gray-600">Customer *</label>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs text-sky-600 hover:text-sky-800"
                >
                  + New Customer
                </button>
              </div>
              <select
                className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
              >
                <option value="">Select Customer</option>
                {saleCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCustomerRecord && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  BAL: Rs. {toNumber(selectedCustomerRecord.balance).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Phone No.</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => {
                  setPhone(sanitizePhoneInput(e.target.value))
                  if (errors.phone) setErrors({ ...errors, phone: null })
                }}
                className={`w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.phone ? 'border-red-300' : ''
                }`}
                placeholder="Phone number"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Billing Address</label>
              <textarea
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded text-sm min-h-[92px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Billing Address"
              />
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
              <span className="text-gray-500">Invoice Number</span>
              <span className="font-semibold text-gray-900">{invoiceNo}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
              <span className="text-gray-500">Invoice Date</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
              <span className="text-gray-500">State of supply</span>
              <select
                value={stateOfSupply}
                onChange={e => setStateOfSupply(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select</option>
                <option value="Delhi">Delhi</option>
                <option value="Haryana">Haryana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
              <span className="text-gray-500">Price Mode</span>
              <select
                value={taxInclusive ? 'inclusive' : 'exclusive'}
                onChange={e => setTaxInclusive(e.target.value === 'inclusive')}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="exclusive">Without Tax</option>
                <option value="inclusive">With Tax</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 flex items-center justify-between gap-3 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
              {message.text}
            </p>
          </div>
          {message.type === 'success' && lastSavedSale && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintLastSale}
                className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                <Send className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleNewSale}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium transition"
              >
                New Sale
              </button>
            </div>
          )}
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">New Customer</h3>
                <p className="text-sm text-slate-500">Add the customer and automatically select them for this sale.</p>
              </div>
              <button
                type="button"
                onClick={closeCustomerModal}
                className="text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <form onSubmit={saveCustomerAndSelect} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    customerErrors.name ? 'border-red-300' : ''
                  }`}
                  autoFocus
                />
                {customerErrors.name && <p className="text-xs text-red-600 mt-1">{customerErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={customerForm.phone}
                  onChange={e => setCustomerForm({ ...customerForm, phone: sanitizePhoneInput(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    customerErrors.phone ? 'border-red-300' : ''
                  }`}
                />
                {customerErrors.phone && <p className="text-xs text-red-600 mt-1">{customerErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    customerErrors.email ? 'border-red-300' : ''
                  }`}
                />
                {customerErrors.email && <p className="text-xs text-red-600 mt-1">{customerErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number *</label>
                <input
                  type="text"
                  value={customerForm.gst}
                  onChange={e => setCustomerForm({ ...customerForm, gst: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    customerErrors.gst ? 'border-red-300' : ''
                  }`}
                />
                {customerErrors.gst && <p className="text-xs text-red-600 mt-1">{customerErrors.gst}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <textarea
                  value={customerForm.address}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    customerErrors.address ? 'border-red-300' : ''
                  }`}
                  rows={4}
                />
                {customerErrors.address && <p className="text-xs text-red-600 mt-1">{customerErrors.address}</p>}
              </div>
              {customerErrors.submit && (
                <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
                  {customerErrors.submit}
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCustomerModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-gray-400"
                >
                  {savingCustomer ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
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

      <div className="bg-white border rounded-lg p-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-3 border rounded text-sm text-gray-400 text-left" type="button">
            Add terms and conditions
          </button>
          <div>
            <label className="text-xs font-semibold text-gray-600">Payment Type</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
            <button type="button" className="text-xs text-sky-600 mt-2">
              + Add Payment type
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_150px_70px] items-center gap-3">
            <label className="text-sm font-semibold text-gray-600">Mechanic Charge</label>
            <input
              type="number"
              value={mechanicCharge}
              onChange={e => setMechanicCharge(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="0"
              step="0.01"
            />
            <span className="text-right font-semibold">{toNumber(mechanicCharge).toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-[1fr_150px_70px] items-center gap-3">
            <label htmlFor="roundoff" className="text-sm text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                id="roundoff"
                checked={roundOff}
                onChange={e => setRoundOff(e.target.checked)}
                className="w-4 h-4 accent-sky-600"
              />
              Round Off
            </label>
            <input
              readOnly
              value={roundOff ? fromCents(roundedSubtotalC - subtotalC) : '0.00'}
              className="px-3 py-2 border rounded text-sm bg-gray-50"
            />
            <span />
          </div>

          <div className="grid grid-cols-[1fr_220px] items-center gap-3">
            <span className="text-sm font-bold text-gray-700">Total</span>
            <input
              readOnly
              value={finalTotal.toFixed(2)}
              className="px-3 py-2 border rounded text-right text-lg font-bold bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-[1fr_220px] items-center gap-3">
            <label className="text-sm font-semibold text-gray-600">Received</label>
            <input
              type="number"
              value={receivedAmount}
              onChange={e => setReceivedAmount(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-between text-sm font-bold text-slate-700 pt-2">
            <span>Balance</span>
            <span>{balanceAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border rounded-lg p-4 flex justify-end gap-3 shadow-sm">
        <button
          type="button"
          className="px-4 py-2 border border-sky-200 text-sky-700 rounded font-medium hover:bg-sky-50"
        >
          Generate e-Invoice
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-8 py-2 rounded font-medium transition"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {store.getLowStockProducts(10).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900">Low Stock Items</p>
          <div className="text-xs text-amber-800 mt-1 grid grid-cols-2 gap-2">
            {store.getLowStockProducts(10).map(p => (
              <div key={p.id}>{p.name}: {p.stock} units</div>
            ))}
          </div>
        </div>
      )}

      {lastSavedSale && (
        <BillShareModal
          isOpen={shareModalOpen}
          onClose={handleCloseShareModal}
          sale={lastSavedSale}
          storeData={{
            products: store.products,
            customers: store.customers,
            businesses: store.businesses,
          }}
        />
      )}
    </div>
  )
}
