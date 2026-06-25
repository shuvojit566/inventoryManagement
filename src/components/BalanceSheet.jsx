import React from 'react'

function Column({ title, items, isRight = false }) {
  const total = items.reduce((s, i) => s + i.amount, 0)
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">{title}</h3>
      <ul className="text-sm space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex justify-between hover:bg-gray-50 px-2 py-1 rounded">
            <span className="text-gray-700">{it.name}</span>
            <span className={`font-semibold ${it.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              ₹{it.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-2 border-t font-bold flex justify-between">
        <span>Total {title}:</span>
        <span className="text-sky-600">₹{total.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default function BalanceSheet({ data }) {
  const liabilities = data?.liabilities || []
  const assets = data?.assets || []
  const equity = data?.equity || []

  const leftItems = [...liabilities, ...equity]
  const rightItems = assets

  const leftTotal = leftItems.reduce((s, i) => s + i.amount, 0)
  const rightTotal = rightItems.reduce((s, i) => s + i.amount, 0)

  const isBalanced = Math.abs(leftTotal - rightTotal) < 0.01

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <Column title="Liabilities & Equity" items={leftItems} />
        </div>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <Column title="Assets" items={rightItems} isRight={true} />
        </div>
      </div>

      {!isBalanced && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          ⚠️ Balance Sheet does not balance. Difference: ₹
          {Math.abs(leftTotal - rightTotal).toFixed(2)}
        </div>
      )}

      {isBalanced && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
          ✓ Balance Sheet is balanced. Total: ₹{rightTotal.toFixed(2)}
        </div>
      )}
    </div>
  )
}

