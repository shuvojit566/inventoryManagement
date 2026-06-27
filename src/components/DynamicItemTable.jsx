import React, { useState, useMemo, useEffect } from 'react'
import { toNumber, toCents, fromCents } from '../utils/math'
import { Plus, Search, X } from 'lucide-react'

const TAX_RATES = [0, 5, 12, 18, 28]

function getProductPrice(product, priceMode) {
  if (!product) return 0
  if (priceMode === 'purchase') return toNumber(product.purchasePrice || product.price)
  return toNumber(product.sellingPrice || product.price)
}

function applyProductToRow(row, product, priceMode) {
  return {
    ...row,
    productId: product.id,
    description: product.name || '',
    price: getProductPrice(product, priceMode),
    qty: product.purchaseQty ?? row.qty,
    unit: product.unit || row.unit || 'pcs',
    tax: toNumber(product.gst ?? product.tax ?? row.tax),
  }
}

function ProductPicker({
  row,
  idx,
  products,
  onPick,
  onCreateProduct,
  creatingProduct,
}) {
  const selectedProduct = products?.find(p => p.id === row.productId)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()
  const filteredProducts = useMemo(() => {
    const needle = trimmedQuery.toLowerCase()
    if (!needle) return products || []
    return (products || []).filter(p => p.name?.toLowerCase().includes(needle))
  }, [products, trimmedQuery])
  const exactMatch = (products || []).some(p => p.name?.toLowerCase() === trimmedQuery.toLowerCase())

  async function handleCreate(name = '') {
    if (!onCreateProduct) return
    setOpen(false)
    await onCreateProduct(idx, name)
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(current => !current)}
          className="min-h-[34px] flex-1 px-2 py-1 border rounded text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
        >
          <span className={selectedProduct ? 'text-gray-900' : 'text-gray-400'}>
            {selectedProduct ? selectedProduct.name : 'Select Product'}
          </span>
          {selectedProduct?.isSaving && (
            <span className="ml-2 text-xs text-sky-600">Saving...</span>
          )}
        </button>
        {onCreateProduct && (
          <button
            type="button"
            onClick={() => handleCreate('')}
            disabled={creatingProduct}
            className="h-[34px] w-[34px] inline-flex items-center justify-center rounded border border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-60"
            title="New Product"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[260px] rounded border bg-white shadow-lg">
          <div className="p-2 border-b flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm focus:outline-none"
              placeholder="Search or type product name"
            />
          </div>
          <div className="max-h-56 overflow-auto py-1">
            {filteredProducts.map(product => (
              <button
                type="button"
                key={product.id}
                onClick={() => {
                  onPick(product)
                  setOpen(false)
                  setQuery('')
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-sky-50 flex items-center justify-between gap-3"
              >
                <span className="font-medium text-gray-800">{product.name}</span>
                <span className="text-xs text-gray-500">Stock: {toNumber(product.stock)}</span>
              </button>
            ))}
            {onCreateProduct && trimmedQuery && !exactMatch && (
              <button
                type="button"
                onClick={() => handleCreate(trimmedQuery)}
                className="w-full px-3 py-2 text-left text-sm text-sky-700 hover:bg-sky-50 border-t"
              >
                Create "{trimmedQuery}"
              </button>
            )}
            {onCreateProduct && (
              <button
                type="button"
                onClick={() => handleCreate(trimmedQuery)}
                className="w-full px-3 py-2 text-left text-sm text-sky-700 hover:bg-sky-50 border-t flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Product
              </button>
            )}
            {filteredProducts.length === 0 && !onCreateProduct && (
              <div className="px-3 py-3 text-sm text-gray-500">No products found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RowInput({
  row,
  idx,
  onChange,
  onRemove,
  products,
  onRequestCreateProduct,
  creatingProduct,
  priceMode,
}) {
  async function handleCreateProduct(rowIndex, name) {
    const product = await onRequestCreateProduct(rowIndex, name)
    if (product) onChange(idx, applyProductToRow(row, product, priceMode))
  }
  
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-600">{idx + 1}</td>
      <td className="px-3 py-2">
        <ProductPicker
          row={row}
          idx={idx}
          products={products}
          creatingProduct={creatingProduct}
          onPick={product => onChange(idx, applyProductToRow(row, product, priceMode))}
          onCreateProduct={onRequestCreateProduct ? handleCreateProduct : null}
        />
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
  onRequestCreateProduct,
  creatingProduct = false,
  priceMode = 'sale',
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
    if (onChangeTotal) onChangeTotal(totals.subtotalC)
    if (onItemsChange) onItemsChange(totals.rows)
  }, [totals])

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-visible">
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
              onRequestCreateProduct={onRequestCreateProduct}
              creatingProduct={creatingProduct}
              priceMode={priceMode}
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

