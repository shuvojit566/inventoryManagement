import React, { useState, useMemo, useEffect } from 'react'
import { toNumber, toCents, fromCents, mulCents, addCents } from '../utils/math'
import { X } from 'lucide-react'

const TAX_RATES = [0, 5, 12, 18, 28]

function RowInput({ row, idx, onChange, onRemove, products }) {
  const product = products?.find(p => p.id === row.productId)
  
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-600">{idx + 1}</td>
      <td className="px-3 py-2">
        <select
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={row.productId || ''}
          onChange={e => {
            const prod = products?.find(p => p.id === e.target.value)
            onChange(idx, {
              ...row,
              productId: e.target.value,
              description: prod?.name || '',
              price: toNumber(prod?.price),
            })
          }}
        >
          <option value="">Select Product</option>
          {products?.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>
        <input
          type="text"
          className="w-full px-2 py-1 border rounded text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="Description"
          value={row.description}
          onChange={e => onChange(idx, { ...row, description: e.target.value })}
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          type="number"
          value={row.qty}
          onChange={e => onChange(idx, { ...row, qty: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={row.unit || 'pcs'}
          onChange={e => onChange(idx, { ...row, unit: e.target.value })}
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          type="number"
          value={row.price}
          onChange={e => onChange(idx, { ...row, price: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          type="number"
          value={row.discount}
          onChange={e => onChange(idx, { ...row, discount: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
        />
      </td>
      <td className="px-3 py-2">
        <select
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={row.tax}
          onChange={e => onChange(idx, { ...row, tax: parseFloat(e.target.value) })}
        >
          {TAX_RATES.map(t => (
            <option key={t} value={t}>
              {t}%
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right text-sm font-semibold text-sky-600">{toNumber(row.amount).toFixed(2)}</td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => onRemove(idx)}
          className="text-red-600 hover:text-red-900 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

export default function DynamicItemTable({
  initialRows = [],
  taxInclusive = false,
  onChangeTotal,
  onItemsChange,
  products = [],
}) {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [{ description: '', productId: '', qty: 1, unit: 'pcs', price: 0, discount: 0, tax: 0 }])

  function updateRow(i, r) {
    const copy = [...rows]
    copy[i] = r
    setRows(copy)
  }

  function removeRow(i) {
    const copy = rows.filter((_, idx) => idx !== i)
    setRows(copy.length > 0 ? copy : [{ description: '', productId: '', qty: 1, unit: 'pcs', price: 0, discount: 0, tax: 0 }])
  }

  function addRow() {
    setRows([...rows, { description: '', productId: '', qty: 1, unit: 'pcs', price: 0, discount: 0, tax: 0 }])
  }

  const totals = useMemo(() => {
    let subtotalC = 0
    const rowsWithAmount = rows.map(r => {
      const priceC = toCents(r.price)
      const qty = toNumber(r.qty)
      const lineBase = priceC * qty
      const discountC = toCents(r.discount)
      const taxFactor = 1 + toNumber(r.tax) / 100
      const taxed = taxInclusive ? Math.round(lineBase) : Math.round(lineBase * taxFactor)
      const amountC = Math.max(0, taxed - discountC)
      subtotalC += amountC
      return { ...r, amount: toNumber(fromCents(amountC)) }
    })
    return { rows: rowsWithAmount, subtotalC }
  }, [rows, taxInclusive])

  useEffect(() => {
    setRows(totals.rows)
    if (onChangeTotal) onChangeTotal(totals.subtotalC)
    if (onItemsChange) onItemsChange(totals.rows)
  }, [totals.subtotalC])

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <th className="px-3 py-3 text-left font-semibold text-gray-700">#</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Product / Details</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Qty</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Unit</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Price</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Discount</th>
            <th className="px-3 py-3 text-left font-semibold text-gray-700">Tax %</th>
            <th className="px-3 py-3 text-right font-semibold text-gray-700">Amount</th>
            <th className="px-3 py-3 text-center font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {totals.rows.map((r, i) => (
            <RowInput
              key={i}
              row={r}
              idx={i}
              onChange={updateRow}
              onRemove={removeRow}
              products={products}
            />
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <button
          className="text-sky-600 hover:text-sky-800 font-medium text-sm transition"
          onClick={addRow}
        >
          + Add Row
        </button>
        <div className="text-sm">
          <span className="text-gray-600">Subtotal: </span>
          <span className="font-bold text-gray-900">₹{fromCents(totals.subtotalC)}</span>
        </div>
      </div>
    </div>
  )
}

