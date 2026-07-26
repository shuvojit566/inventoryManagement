import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Download, Printer, ArrowLeft } from 'lucide-react'
import BillTemplate from '../components/BillTemplate'
import { retrieveBillFromToken, printBill, formatBillForShare } from '../utils/billShare'

export default function BillView() {
  const { token } = useParams()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadBill = () => {
      try {
        const billData = retrieveBillFromToken(token)
        if (!billData) {
          setError('Bill not found or link expired')
        } else {
          setBill(billData)
        }
      } catch (err) {
        setError('Failed to load bill')
      } finally {
        setLoading(false)
      }
    }
    loadBill()
  }, [token])

  const handlePrint = () => {
    if (bill) {
      const formattedBill = formatBillForShare(bill, bill.storeData)
      printBill(formattedBill)
    }
  }

  const handleDownloadPDF = () => {
    if (bill) {
      // Generate HTML and download as PDF
      const printWindow = window.open('', '', 'height=800,width=900')
      const customer = bill.storeData?.customers?.find(c => c.id === bill.customerId)
      const business = bill.storeData?.businesses?.[0] || {}
      const items = bill.items.map(item => ({
        ...item,
        productName: bill.storeData?.products?.find(p => p.id === item.productId)?.name || 'Unknown',
      }))
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice-${bill.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header p { font-size: 10px; color: #666; }
            .title { font-size: 14px; font-weight: bold; margin-top: 10px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .summary { width: 100%; margin-top: 20px; }
            .summary-row { display: grid; grid-template-columns: 1fr 100px; gap: 10px; padding: 5px 0; font-size: 11px; }
            .summary-row.total { font-weight: bold; font-size: 12px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; }
            .footer { text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${business.name || 'INVOICE'}</h1>
              ${business.address ? `<p>${business.address}</p>` : ''}
              ${business.phone ? `<p>Phone: ${business.phone}</p>` : ''}
              ${business.gst ? `<p>GST: ${business.gst}</p>` : ''}
              <div class="title">INVOICE / BILL</div>
            </div>
            <div class="details">
              <div>
                <p>Invoice No: <strong>${bill.id}</strong></p>
                <p>Date: ${new Date(bill.date).toLocaleDateString('en-GB')}</p>
                <p>Payment Mode: ${bill.paymentMode || 'Cash'}</p>
              </div>
              <div>
                <p>Customer: <strong>${customer?.name || 'N/A'}</strong></p>
                ${customer?.phone ? `<p>Phone: ${customer.phone}</p>` : ''}
                ${customer?.address ? `<p>Address: ${customer.address}</p>` : ''}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Item</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Discount</th>
                  <th class="text-right">Tax</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productName}</td>
                    <td class="text-right">${item.qty} ${item.unit || 'pcs'}</td>
                    <td class="text-right">Rs. ${parseFloat(item.price).toFixed(2)}</td>
                    <td class="text-right">Rs. ${parseFloat(item.discount).toFixed(2)}</td>
                    <td class="text-right">Rs. ${parseFloat(item.tax).toFixed(2)}</td>
                    <td class="text-right">Rs. ${parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span class="text-right">Rs. ${items.reduce((s, i) => s + parseFloat(i.amount), 0).toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount Due:</span>
                <span class="text-right">Rs. ${parseFloat(bill.total).toFixed(2)}</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p style="margin-top: 10px; font-size: 9px;">This is an electronically generated document</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded">
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!bill) return null

  const customer = bill.storeData?.customers?.find(c => c.id === bill.customerId)
  const business = bill.storeData?.businesses?.[0] || {}
  const items = bill.items.map(item => ({
    ...item,
    productName: bill.storeData?.products?.find(p => p.id === item.productId)?.name || 'Unknown',
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded font-medium transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Bill Display */}
      <div className="flex items-center justify-center py-8 print:py-0">
        <BillTemplate sale={bill} customer={customer} items={items} business={business} />
      </div>
    </div>
  )
}
