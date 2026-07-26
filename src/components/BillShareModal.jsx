import React, { useState } from 'react'
import { X, Mail, MessageCircle, Copy, Check } from 'lucide-react'
import { generateBillShareURL, shareViaWhatsApp, shareViaEmail, generateWhatsAppText, generateEmailContent } from '../utils/billShare'
import { sanitizePhoneInput, isValidPhoneNumber } from '../utils/phone'

export default function BillShareModal({ isOpen, onClose, sale, storeData }) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState(storeData?.customers?.find(c => c.id === sale.customerId)?.email || '')
  const [phone, setPhone] = useState(sanitizePhoneInput(storeData?.customers?.find(c => c.id === sale.customerId)?.phone || ''))
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  if (!isOpen) return null

  const customer = storeData?.customers?.find(c => c.id === sale.customerId)
  const billURL = generateBillShareURL(sale.id, storeData)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(billURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    if (!phone) {
      setError('Please enter a phone number')
      return
    }
    if (!isValidPhoneNumber(phone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    try {
      setError(null)
      const formattedBill = {
        ...sale,
        items: sale.items.map(item => ({
          ...item,
          productName: storeData.products.find(p => p.id === item.productId)?.name || 'Unknown',
        })),
        customer,
      }
      const text = generateWhatsAppText(formattedBill, billURL)
      shareViaWhatsApp(phone, text)
      setSuccessMessage('Opening WhatsApp...')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      setError('Failed to share via WhatsApp')
    }
  }

  const handleShareEmail = () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }
    try {
      setError(null)
      const formattedBill = {
        ...sale,
        items: sale.items.map(item => ({
          ...item,
          productName: storeData.products.find(p => p.id === item.productId)?.name || 'Unknown',
        })),
        customer,
      }
      const { subject, body } = generateEmailContent(formattedBill, billURL)
      shareViaEmail(email, subject, body)
      setSuccessMessage('Opening email client...')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      setError('Failed to share via email')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Share Bill</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

          {/* Success Message */}
          {successMessage && <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">{successMessage}</div>}

          {/* Bill Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Shareable Link</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded">
              <input
                type="text"
                value={billURL}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-600 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-200 rounded transition"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or share directly</span>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Share via WhatsApp</label>
            <div className="space-y-2">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => {
                  setPhone(sanitizePhoneInput(e.target.value))
                  if (error) setError(null)
                }}
                placeholder="Phone number (e.g., 9876543210)"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
              >
                <MessageCircle className="w-4 h-4" />
                Share via WhatsApp
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Share via Email</label>
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleShareEmail}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded font-medium transition"
              >
                <Mail className="w-4 h-4" />
                Share via Email
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
