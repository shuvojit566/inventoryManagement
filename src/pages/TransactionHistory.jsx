import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Printer, Download, ArrowUpDown, Eye, X, Trash2 } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'
import useStore from '../store/useStore'
import { toNumber } from '../utils/math'

const PAGE_SIZES = [10, 20, 50]

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB')
}

function downloadCsv(headers, rows, filename) {
  const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportXlsx(headers, rows, filename) {
  const worksheetData = [headers, ...rows]
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}

export default function TransactionHistory({ type }) {
  const store = useStore()
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedParty, setSelectedParty] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [message, setMessage] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const tableRef = useRef(null)

  const isSales = type === 'sales'
  const title = isSales ? 'Sales History' : 'Purchase History'
  const partyLabel = isSales ? 'Customer' : 'Supplier'
  const records = useMemo(() => (isSales ? store.sales : store.purchases), [store.sales, store.purchases, isSales])
  const partyOptions = useMemo(() => {
    if (isSales) {
      return store.customers.filter(c => (c.type || 'selling') !== 'purchased')
    }
    return store.customers.filter(c => (c.type || '') === 'purchased')
  }, [store.customers, isSales])

  const recordsWithDerived = useMemo(() => {
    return records.map(record => {
      const party = isSales ? store.getCustomer(record.customerId) : store.getCustomer(record.supplierId)
      const partyName = party?.name || 'Unknown'
      const items = Array.isArray(record.items) ? record.items : []
      const itemSummary = items
        .map(item => {
          const product = store.getProduct(item.productId)
          return `${product?.name || item.productId || 'Unknown'} x${toNumber(item.qty)}`
        })
        .join(', ')
      const totalQty = items.reduce((sum, item) => sum + toNumber(item.qty), 0)
      const invoice = `${isSales ? 'INV' : 'PUR'}-${record.id}`
      const status = isSales
        ? toNumber(record.balance) > 0
          ? 'Pending'
          : 'Paid'
        : toNumber(record.balance) === 0
        ? 'Paid'
        : 'Pending'
      const date = record.date ? record.date.slice(0, 10) : ''
      const paymentMode = record.paymentMode || 'cash'
      const total = toNumber(record.total)
      const received = record.received !== undefined ? toNumber(record.received) : total
      const balance = toNumber(record.balance ?? 0)
      const state = record.stateOfSupply || '-'
      const note = record.billingAddress || record.note || ''
      return {
        ...record,
        invoice,
        partyName,
        itemSummary,
        totalQty,
        status,
        date,
        paymentMode,
        total,
        received,
        balance,
        state,
        note,
      }
    })
  }, [records, store, isSales])

  const paymentModes = useMemo(() => {
    return Array.from(new Set(recordsWithDerived.map(r => r.paymentMode))).filter(Boolean)
  }, [recordsWithDerived])

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return recordsWithDerived.filter(record => {
      if (dateFrom && record.date < dateFrom) return false
      if (dateTo && record.date > dateTo) return false
      if (selectedParty && ((isSales ? record.customerId : record.supplierId) || '') !== selectedParty) return false
      if (selectedPaymentMode && record.paymentMode !== selectedPaymentMode) return false
      if (selectedStatus && record.status !== selectedStatus) return false
      if (!needle) return true
      const searched = [
        record.invoice,
        record.partyName,
        record.paymentMode,
        record.status,
        record.itemSummary,
        record.note,
        record.date,
        record.total,
        record.balance,
        record.state,
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle))
      return searched
    })
  }, [recordsWithDerived, dateFrom, dateTo, selectedParty, selectedPaymentMode, selectedStatus, query, isSales])

  const sortedRecords = useMemo(() => {
    const rows = [...filteredRecords]
    rows.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (aValue === bValue) return 0
      let compare = 0
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        compare = aValue - bValue
      } else if (sortField === 'date') {
        compare = new Date(aValue) - new Date(bValue)
      } else {
        compare = String(aValue || '').localeCompare(String(bValue || ''), undefined, { numeric: true })
      }
      return sortDirection === 'asc' ? compare : -compare
    })
    return rows
  }, [filteredRecords, sortField, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredRecords.length, pageSize])

  const pageCount = Math.max(1, Math.ceil(sortedRecords.length / pageSize))
  const visibleRows = useMemo(() => {
    const fromIndex = (currentPage - 1) * pageSize
    return sortedRecords.slice(fromIndex, fromIndex + pageSize)
  }, [sortedRecords, currentPage, pageSize])

  const summary = useMemo(() => {
    const totalTransactions = filteredRecords.length
    const totalAmount = filteredRecords.reduce((sum, record) => sum + record.total, 0)
    const totalBalance = filteredRecords.reduce((sum, record) => sum + record.balance, 0)
    return {
      totalTransactions,
      totalAmount,
      totalBalance,
    }
  }, [filteredRecords])

  const exportHeaders = [
    'Invoice No',
    'Date',
    partyLabel,
    'Items',
    'Qty',
    'Total',
    'Received',
    'Balance',
    'Status',
    'Payment Mode',
    'State',
    'Notes',
  ]

  const exportRows = useMemo(() => {
    return filteredRecords.map(record => [
      record.invoice,
      formatDate(record.date),
      record.partyName,
      record.itemSummary,
      record.totalQty,
      record.total,
      record.received,
      record.balance,
      record.status,
      record.paymentMode,
      record.state,
      record.note,
    ])
  }, [filteredRecords])

  const handleExportCsv = () => {
    downloadCsv(exportHeaders, exportRows, `${type}-history.csv`)
  }

  const handleExportXlsx = () => {
    exportXlsx(exportHeaders, exportRows, `${type}-history.xlsx`)
  }

  const handleExportPdf = () => {
    if (!tableRef.current) return
    html2pdf()
      .set({ margin: 0.5, filename: `${type}-history.pdf`, html2canvas: { scale: 2 } })
      .from(tableRef.current)
      .save()
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortField(field)
    setSortDirection('asc')
  }

  const handleDelete = async (record) => {
    if (!window.confirm('Delete this transaction?')) return
    setDeleteLoading(true)
    try {
      if (isSales) {
        await store.deleteSale(record.id)
      } else {
        await store.deletePurchase(record.id)
      }
      setMessage({ type: 'success', text: 'Record deleted successfully' })
      setSelectedRecord(null)
      setTimeout(() => setMessage(null), 2500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to delete record' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">Browse all {isSales ? 'sales' : 'purchase'} records with filtering, sorting, and export.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={isSales ? '/sale/new' : '/purchase/new'}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            New {isSales ? 'Sale' : 'Purchase'}
          </Link>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportXlsx}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            XLSX
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search records"
                className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={selectedParty}
                onChange={e => setSelectedParty(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All {partyLabel}s</option>
                {partyOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedPaymentMode}
                onChange={e => setSelectedPaymentMode(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Payment Modes</option>
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total Transactions</span>
            <strong>{summary.totalTransactions}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total {isSales ? 'Sales' : 'Purchases'}</span>
            <strong>₹{toNumber(summary.totalAmount).toFixed(2)}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total Outstanding</span>
            <strong>₹{toNumber(Math.abs(summary.totalBalance)).toFixed(2)}</strong>
          </div>
          <div className="text-xs text-gray-500">Filtered results are shown in the table below.</div>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div ref={tableRef} className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('invoice')}>
                  Invoice
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('date')}>
                  Date
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('partyName')}>
                  {partyLabel}
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('total')}>
                  Total
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('paymentMode')}>
                  Payment
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('status')}>
                  Status
                  <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                </th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-sm text-gray-500">
                    No {isSales ? 'sales' : 'purchases'} found for the selected filters.
                  </td>
                </tr>
              ) : (
                visibleRows.map(record => (
                  <tr
                    key={record.id}
                    className="border-t hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-4 py-3 font-medium">{record.invoice}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(record.date)}</td>
                    <td className="px-4 py-3">{record.partyName}</td>
                    <td className="px-4 py-3 text-slate-600">{record.itemSummary || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">₹{record.total.toFixed(2)}</td>
                    <td className="px-4 py-3 capitalize">{record.paymentMode}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${record.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">₹{record.balance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedRecord(record)
                        }}
                        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Showing</span>
          <strong>{visibleRows.length}</strong>
          <span>of</span>
          <strong>{filteredRecords.length}</strong>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2">
              {currentPage} / {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title} Details</h3>
                <p className="text-sm text-slate-500">{selectedRecord.invoice}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedRecord)}
                  className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded text-sm font-medium hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <div className="font-semibold text-slate-800">Invoice</div>
                    <div>{selectedRecord.invoice}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Date</div>
                    <div>{formatDate(selectedRecord.date)}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{partyLabel}</div>
                    <div>{selectedRecord.partyName}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Payment Mode</div>
                    <div className="capitalize">{selectedRecord.paymentMode}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Status</div>
                    <div>{selectedRecord.status}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Balance</div>
                    <div>₹{selectedRecord.balance.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">State</div>
                    <div>{selectedRecord.state}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Total Qty</div>
                    <div>{selectedRecord.totalQty}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Notes</div>
                  <p className="text-sm text-slate-600">{selectedRecord.note || '-'}</p>
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm mb-2">Items</div>
                  <div className="space-y-2">
                    {Array.isArray(selectedRecord.items) && selectedRecord.items.length > 0 ? (
                      selectedRecord.items.map((item, index) => {
                        const product = store.getProduct(item.productId)
                        return (
                          <div key={index} className="grid grid-cols-[1fr_80px_80px] gap-3 rounded-lg border p-3 text-sm">
                            <div>
                              <div className="font-medium">{product?.name || item.productId}</div>
                              <div className="text-slate-500">{item.unit || 'pcs'} · ₹{toNumber(item.price).toFixed(2)} each</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Qty</div>
                              <div>{toNumber(item.qty)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Amount</div>
                              <div>₹{toNumber(item.amount).toFixed(2)}</div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-slate-500">No items recorded.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Total Amount</span>
                  <strong>₹{selectedRecord.total.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Received</span>
                  <strong>₹{selectedRecord.received.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Balance</span>
                  <strong>₹{selectedRecord.balance.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Payment Method</span>
                  <strong className="capitalize">{selectedRecord.paymentMode}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedRecord)}
                    disabled={deleteLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
