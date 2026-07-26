import React from 'react'
import { toNumber } from '../utils/math'

function formatCurrency(val) {
  return `Rs. ${toNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB')
}

export default function BillTemplate({ sale, customer, items, business }) {
  const subtotal = items.reduce((sum, item) => sum + toNumber(item.amount), 0)
  const totalTax = items.reduce((sum, item) => sum + toNumber(item.tax), 0)
  const mechanicCharge = toNumber(sale.mechanicCharge || 0)
  const labourCharge = toNumber(sale.labourCharge || 0)
  const installationCharge = toNumber(sale.installationCharge || 0)
  const serviceCharge = toNumber(sale.serviceCharge || 0)
  const otherCharges = toNumber(sale.otherCharges || 0)
  const totalServiceCharges = mechanicCharge + labourCharge + installationCharge + serviceCharge + otherCharges

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white print:p-0 print:max-w-none">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold">{business?.name || 'INVOICE'}</h1>
        {business?.address && <p className="text-xs text-gray-600 mt-1">{business.address}</p>}
        {business?.phone && <p className="text-xs text-gray-600">{business.phone}</p>}
        {business?.gst && <p className="text-xs text-gray-600">GST: {business.gst}</p>}
        <h2 className="text-lg font-bold mt-3">INVOICE / BILL</h2>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div>
          <p className="mb-2">
            <span className="font-semibold">Invoice No:</span>
            <span className="ml-2 font-bold text-lg">{sale.id}</span>
          </p>
          <p className="mb-2">
            <span className="font-semibold">Date:</span>
            <span className="ml-2">{formatDate(sale.date)}</span>
          </p>
          <p>
            <span className="font-semibold">Payment Mode:</span>
            <span className="ml-2 capitalize">{sale.paymentMode || 'Cash'}</span>
          </p>
        </div>

        <div>
          <p className="mb-2">
            <span className="font-semibold">Customer:</span>
            <span className="ml-2 font-bold text-base">{customer?.name || 'N/A'}</span>
          </p>
          {customer?.phone && (
            <p className="mb-2">
              <span className="font-semibold">Phone:</span>
              <span className="ml-2">{customer.phone}</span>
            </p>
          )}
          {customer?.address && (
            <p>
              <span className="font-semibold">Address:</span>
              <span className="ml-2 text-xs">{customer.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-black">
            <th className="px-2 py-2 text-left font-semibold">SN</th>
            <th className="px-2 py-2 text-left font-semibold">Item Description</th>
            <th className="px-2 py-2 text-right font-semibold">Qty</th>
            <th className="px-2 py-2 text-right font-semibold">Unit Price</th>
            <th className="px-2 py-2 text-right font-semibold">Discount</th>
            <th className="px-2 py-2 text-right font-semibold">Tax</th>
            <th className="px-2 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="px-2 py-2">{idx + 1}</td>
              <td className="px-2 py-2">{item.productName}</td>
              <td className="px-2 py-2 text-right">{toNumber(item.qty).toLocaleString('en-IN', { maximumFractionDigits: 2 })} {item.unit || 'pcs'}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(item.price)}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(item.discount)}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(item.tax)}</td>
              <td className="px-2 py-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mb-6 ml-auto w-80">
        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
          <span className="font-semibold">Subtotal:</span>
          <span className="text-right">{formatCurrency(subtotal)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
          <span className="font-semibold">Total Tax (GST):</span>
          <span className="text-right">{formatCurrency(totalTax)}</span>
        </div>
        {mechanicCharge > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Mechanic Charge:</span>
            <span className="text-right">{formatCurrency(mechanicCharge)}</span>
          </div>
        )}
        {labourCharge > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Labour Charge:</span>
            <span className="text-right">{formatCurrency(labourCharge)}</span>
          </div>
        )}
        {installationCharge > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Installation Charge:</span>
            <span className="text-right">{formatCurrency(installationCharge)}</span>
          </div>
        )}
        {serviceCharge > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Service Charge:</span>
            <span className="text-right">{formatCurrency(serviceCharge)}</span>
          </div>
        )}
        {otherCharges > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Other Charges:</span>
            <span className="text-right">{formatCurrency(otherCharges)}</span>
          </div>
        )}

        {totalServiceCharges > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <span className="font-semibold">Labour / Service Charges:</span>
            <span className="text-right">{formatCurrency(totalServiceCharges)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-lg font-bold border-t-2 border-b-2 border-black py-2">
          <span>Total Amount Due:</span>
          <span className="text-right">{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t pt-4">
        <p>Thank you for your business!</p>
        <p className="mt-2 text-xs">This is an electronically generated document</p>
      </div>
    </div>
  )
}
