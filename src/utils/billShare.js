import { toNumber } from './math'

/**
 * Generate a unique bill URL token
 */
export function generateBillToken(saleId) {
  return `bill_${saleId}_${Date.now()}`
}

/**
 * Store bill in localStorage for URL access
 */
export function storeBillForSharing(bill, storeData) {
  const token = generateBillToken(bill.id)
  const billData = {
    ...bill,
    storeData, // Store product names, customer info, etc.
    sharedAt: new Date().toISOString(),
  }
  localStorage.setItem(`bill_${token}`, JSON.stringify(billData))
  return token
}

/**
 * Retrieve bill from localStorage using token
 */
export function retrieveBillFromToken(token) {
  const billData = localStorage.getItem(`bill_${token}`)
  return billData ? JSON.parse(billData) : null
}

/**
 * Generate shareable bill URL
 */
export function generateBillShareURL(saleId, storeData) {
  const token = storeBillForSharing({ id: saleId }, storeData)
  const baseURL = window.location.origin
  return `${baseURL}/bill/${token}`
}

/**
 * Format bill for printing/sharing
 */
export function formatBillForShare(sale, storeData) {
  const customer = storeData.customers.find(c => c.id === sale.customerId)
  const business = storeData.businesses?.[0] || {}

  const items = sale.items.map(item => {
    const product = storeData.products.find(p => p.id === item.productId)
    return {
      ...item,
      productName: product?.name || 'Unknown Product',
      productCode: product?.code || '-',
    }
  })

  const subtotal = items.reduce((sum, item) => sum + toNumber(item.amount), 0)
  const totalTax = items.reduce((sum, item) => sum + toNumber(item.tax), 0)
  const mechanicCharge = toNumber(sale.mechanicCharge || 0)
  const total = toNumber(sale.total)

  return {
    ...sale,
    items,
    customer,
    business,
    subtotal,
    totalTax,
    mechanicCharge,
    total,
  }
}

/**
 * Generate HTML for bill printing
 */
export function generateBillHTML(formattedBill) {
  const { business, customer, items, subtotal, totalTax, mechanicCharge, total, paymentMode, date, id } = formattedBill

  const formatCurrency = val => `Rs. ${toNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = dateStr => new Date(dateStr).toLocaleDateString('en-GB')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
        .business-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .business-info { font-size: 10px; color: #666; }
        .invoice-title { font-size: 14px; font-weight: bold; margin-top: 10px; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; font-size: 11px; }
        .detail-block { }
        .detail-block label { font-weight: bold; display: inline-block; width: 80px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table thead { background-color: #f0f0f0; }
        .table th, .table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
        .table th { font-weight: bold; }
        .table .text-right { text-align: right; }
        .summary { width: 100%; margin-top: 20px; }
        .summary-row { display: grid; grid-template-columns: 1fr 100px; gap: 10px; padding: 5px 0; font-size: 11px; }
        .summary-row.total { font-weight: bold; font-size: 12px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; }
        .summary-row label { font-weight: 500; }
        .summary-row .value { text-align: right; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { body { margin: 0; padding: 0; } .container { max-width: 100%; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="business-name">${business.name || 'Invoice'}</div>
          <div class="business-info">
            ${business.address ? `<div>${business.address}</div>` : ''}
            ${business.phone ? `<div>Phone: ${business.phone}</div>` : ''}
            ${business.gst ? `<div>GST: ${business.gst}</div>` : ''}
          </div>
          <div class="invoice-title">INVOICE / BILL</div>
        </div>

        <div class="invoice-details">
          <div class="detail-block">
            <div><label>Invoice No:</label> <strong>${id}</strong></div>
            <div><label>Date:</label> ${formatDate(date)}</div>
            <div><label>Payment Mode:</label> ${paymentMode || 'Cash'}</div>
          </div>
          <div class="detail-block">
            <div><label>Customer:</label> <strong>${customer?.name || 'N/A'}</strong></div>
            ${customer?.phone ? `<div><label>Phone:</label> ${customer.phone}</div>` : ''}
            ${customer?.address ? `<div><label>Address:</label> ${customer.address}</div>` : ''}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 30px;">SN</th>
              <th>Item Description</th>
              <th class="text-right" style="width: 60px;">Qty</th>
              <th class="text-right" style="width: 70px;">Unit Price</th>
              <th class="text-right" style="width: 70px;">Discount</th>
              <th class="text-right" style="width: 60px;">Tax</th>
              <th class="text-right" style="width: 80px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.productName}</td>
                <td class="text-right">${toNumber(item.qty).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${item.unit || 'pcs'}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-right">${formatCurrency(item.discount)}</td>
                <td class="text-right">${formatCurrency(item.tax)}</td>
                <td class="text-right">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <label>Subtotal:</label>
            <span class="value">${formatCurrency(subtotal)}</span>
          </div>
          <div class="summary-row">
            <label>Total Tax (GST):</label>
            <span class="value">${formatCurrency(totalTax)}</span>
          </div>
          ${mechanicCharge > 0 ? `
            <div class="summary-row">
              <label>Mechanic Charge:</label>
              <span class="value">${formatCurrency(mechanicCharge)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <label>Total Amount Due:</label>
            <span class="value">${formatCurrency(total)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 10px; font-size: 9px;">This is an electronically generated document</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Print bill
 */
export function printBill(formattedBill) {
  const html = generateBillHTML(formattedBill)
  const printWindow = window.open('', '', 'height=800,width=900')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

/**
 * Generate WhatsApp share text
 */
export function generateWhatsAppText(formattedBill, billURL) {
  const { customer, total, id, date } = formattedBill
  const formatDate = dateStr => new Date(dateStr).toLocaleDateString('en-GB')
  const formatCurrency = val => `Rs. ${toNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return `Hi ${customer?.name || 'Customer'},

Your Invoice Bill is ready!

Invoice #: ${id}
Date: ${formatDate(date)}
Total Amount: ${formatCurrency(total)}

View your bill: ${billURL}

Thank you!`
}

/**
 * Share via WhatsApp
 */
export function shareViaWhatsApp(phone, text) {
  const encodedText = encodeURIComponent(text)
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodedText}`
  window.open(whatsappURL, '_blank')
}

/**
 * Generate email subject and body
 */
export function generateEmailContent(formattedBill, billURL) {
  const { customer, total, id, date, items } = formattedBill
  const formatDate = dateStr => new Date(dateStr).toLocaleDateString('en-GB')
  const formatCurrency = val => `Rs. ${toNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const subject = `Your Invoice #${id} - ${formatDate(date)}`

  const itemsList = items.map(item => `• ${item.productName} - Qty: ${toNumber(item.qty)} - ${formatCurrency(item.amount)}`).join('\n')

  const body = `Hi ${customer?.name || 'Customer'},

Please find your invoice details below:

Invoice Number: ${id}
Date: ${formatDate(date)}

Items:
${itemsList}

Total Amount: ${formatCurrency(total)}

View full bill: ${billURL}

Thank you for your business!

Best regards`

  return { subject, body }
}

/**
 * Share via Email
 */
export function shareViaEmail(email, subject, body) {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  const mailtoURL = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
  window.location.href = mailtoURL
}
