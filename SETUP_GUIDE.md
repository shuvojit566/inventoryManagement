# GST ERP - Inventory & Invoice Management System

A modern, full-featured GST-compliant inventory and invoice management system built with React, Vite, Zustand, and Tailwind CSS with JSON Server backend.

## 🎯 Features

### Dashboard
- **Real-time Statistics**: Sales today, expenses, receivables at a glance
- **Inventory Status**: Total products and inventory value
- **Customer Overview**: Active customers and credit information
- **Low Stock Alerts**: Warning system for products running low
- **Recent Transactions**: Quick view of today's transactions

### Products Management (/items)
- Add, edit, and delete products
- HSN code management
- Stock tracking with low stock warnings
- Inventory valuation
- Product details and pricing

### Customers Management (/parties)
- Add, edit, and delete customers
- Track customer balances (receivables/payables)
- Phone number storage for contact
- Debtor/creditor status indicators
- Balance settlement tracking

### Sales Module (/sale/new)
- Create new invoices with dynamic item table
- Product selection with stock checking
- Tax mode support (inclusive/exclusive)
- Automatic tax calculation
- Multiple tax rate support (0%, 5%, 12%, 18%, 28%)
- Round-off adjustment
- Payment mode selection (Cash/Credit)
- Customer selection for credit sales
- Automatic stock and balance updates

### Reports Module
- **Day Book**: Transaction history with date filtering
- **Balance Sheet**: Assets, liabilities, and equity summary
- **Summary Reports**: Financial and inventory summaries
- CSV export functionality
- Transaction filtering and sorting

### Settings
- General settings management
- Require GSTIN Number
- Stop sale on negative stock
- Passcode lock option
- Audit trail tracking
- Print theme selection

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd inventoryManagement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the JSON Server (Database)**
   ```bash
   npm run json-server
   ```
   Server will run on `http://localhost:4000`

4. **In a new terminal, start the development server**
   ```bash
   npm run dev
   ```
   App will run on `http://localhost:5173` (or the URL shown in terminal)

## 📁 Project Structure

```
src/
├── components/
│   ├── BalanceSheet.jsx        # Balance sheet display
│   ├── DynamicItemTable.jsx    # Reusable item entry table
│   ├── SettingsPanel.jsx       # Settings configuration
│   ├── Sidebar.jsx             # Navigation sidebar
│   └── Topbar.jsx              # Top navigation bar
├── pages/
│   ├── Dashboard.jsx           # Main dashboard
│   ├── ProductsManagement.jsx  # Products CRUD
│   ├── CustomersManagement.jsx # Customers CRUD
│   ├── SaleNew.jsx             # Create new sales
│   ├── Reports.jsx             # Reports and analytics
│   └── Settings.jsx            # Settings page
├── store/
│   └── useStore.js             # Zustand state management
├── styles/
│   └── index.css               # Tailwind CSS
├── utils/
│   ├── api.js                  # API communication
│   └── math.js                 # Currency calculations
├── App.jsx                     # Main app component
└── main.jsx                    # Entry point
```

## 🗄️ Database Schema

### db.json Structure

```json
{
  "businesses": [
    { "id": "b1", "name": "Company Name", "gstin": "GSTIN..." }
  ],
  "products": [
    { "id": "p1", "name": "Product Name", "hsn": "HSN", "price": 100, "stock": 50 }
  ],
  "customers": [
    { "id": "c1", "name": "Customer Name", "phone": "9999999999", "balance": 1000 }
  ],
  "sales": [
    { "id": 1, "date": "ISO-Date", "customerId": "c1", "items": [...], "total": 1000, "paymentMode": "cash" }
  ],
  "expenses": [
    { "id": 1, "date": "ISO-Date", "description": "Expense", "amount": 100, "category": "rent" }
  ],
  "settings": {
    "id": "default",
    "requireGSTIN": false,
    "stopOnNegativeStock": true,
    "passcodeLock": false,
    "auditTrail": true,
    "printTheme": "GST Theme 1"
  }
}
```

## 🎮 How to Use

### Creating a Sale
1. Click "New Sale" in topbar or navigate to `/sale/new`
2. Select payment mode (Cash/Credit)
3. For credit sales, select a customer
4. Add items to the table using product selection dropdown
5. Items automatically update stock and calculate totals
6. Choose tax mode (inclusive/exclusive)
7. Apply round-off if needed
8. Click "Save Sale" to complete

### Managing Products
1. Navigate to Products (/items)
2. Click "Add Product"
3. Fill in product details (name, HSN, price, stock)
4. Click "Add Product" to save
5. Edit or delete products using action buttons
6. View inventory status and valuation

### Managing Customers
1. Navigate to Customers (/parties)
2. Click "Add Customer"
3. Enter customer details
4. Manage customer balances (positive = they owe, negative = you owe)
5. View receivables and payables summary

### Viewing Reports
1. Navigate to Reports (/reports)
2. Switch between Day Book, Balance Sheet, and Summary tabs
3. For Day Book:
   - Select date to filter transactions
   - View detailed transaction list
   - Export to CSV
4. For Balance Sheet:
   - See assets, liabilities, and equity
   - Verify balance

### Configuring Settings
1. Navigate to Settings (/settings)
2. Toggle options as needed:
   - Require GSTIN for businesses
   - Prevent negative stock sales
   - Enable passcode lock
   - Select print theme
3. Click "Save Changes"

## 🔧 Configuration

### API Base URL
If your JSON Server runs on a different port, update in `src/utils/api.js`:
```javascript
const API_BASE = 'http://localhost:4000' // Change port here
```

### Tailwind CSS
Tailwind is pre-configured in the project. Add custom styles in `src/styles/index.css`.

## 📊 State Management

The app uses **Zustand** for state management. Key store methods:

```javascript
// Products
addProduct(product)
updateProduct(id, product)
deleteProduct(id)
getProduct(id)

// Customers
addCustomer(customer)
updateCustomer(id, customer)
getCustomer(id)

// Sales
addSale(sale)
deleteSale(id)
getSalesToday()

// Expenses
addExpense(expense)
deleteExpense(id)
getExpensesToday()

// Utilities
getTotalReceivables()
getTotalTodaysSales()
getTotalTodaysExpenses()
getLowStockProducts(threshold)
```

## 🔒 Security Features

- Optional passcode lock
- Audit trail logging
- Input validation
- Stock validation before sales
- Balance tracking for receivables/payables

## 🐛 Troubleshooting

### App won't start
- Ensure Node.js is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### JSON Server not connecting
- Verify server is running on localhost:4000
- Check for port conflicts: `lsof -i :4000`
- Restart the server

### Data not persisting
- Ensure `db.json` exists in project root
- Check file permissions
- Verify JSON format in db.json

### Styling issues
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Rebuild Tailwind CSS: `npm run build`

## 📈 Performance Tips

1. **Use CSV export** for large reports instead of rendering in browser
2. **Regular backups** of `db.json`
3. **Archive old transactions** periodically to keep database small
4. **Use filters** when viewing large datasets

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output files will be in `dist/` directory. Deploy to any static hosting service.

### Environment Variables
Create `.env` file for production:
```
VITE_API_BASE=https://your-api-server.com
```

Then update `src/utils/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
```

## 📝 Sample Data

The project includes sample data in `db.json`:
- 1 business (Acme Traders)
- 3 products
- 3 customers
- 2 sample sales
- 2 sample expenses

You can add more data through the UI or directly in `db.json`.

## 🤝 Contributing

Feel free to extend this application with additional features like:
- Purchase orders
- Quotations
- Expense categories
- Multi-user support
- Cloud backup
- Mobile app

## 📄 License

This project is for educational purposes. Modify and use as needed.

## 📞 Support

For issues or questions, check the following:
1. Ensure all dependencies are installed
2. Verify JSON Server is running
3. Check browser console for errors (F12)
4. Clear browser cache

---

**Happy Invoicing! 🎉**
