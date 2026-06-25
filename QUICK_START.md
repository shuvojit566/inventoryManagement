# Quick Start Guide - GST ERP

## 🏃 5-Minute Setup

### Step 1: Install & Start Servers (2 terminals)

**Terminal 1 - JSON Server (Database)**
```bash
npm run json-server
# Runs on http://localhost:4000
```

**Terminal 2 - Development Server**
```bash
npm run dev
# Opens http://localhost:5173
```

### Step 2: First Actions
- ✅ Dashboard loads automatically with sample data
- ✅ View today's sales and expenses in stats cards
- ✅ Check recent transactions

### Step 3: Add Products
1. Click sidebar → **Products**
2. Click **Add Product**
3. Fill details:
   - Name: Widget A
   - HSN: 1234
   - Price: 199
   - Stock: 100
4. Click **Add Product**

### Step 4: Add Customers
1. Click sidebar → **Customers**
2. Click **Add Customer**
3. Fill details:
   - Name: John Doe
   - Phone: 9999999999
   - Balance: 0 (for now)
4. Click **Add Customer**

### Step 5: Create First Sale
1. Click **New Sale** button in topbar
2. Select **Payment Mode**: Cash
3. Click in items table to add a row
4. Select product from dropdown
5. Enter Quantity: 2
6. Select Tax: 18%
7. Click **Save Sale**

### Step 6: View Reports
1. Click sidebar → **Reports**
2. Switch tabs:
   - **Day Book**: See your transaction
   - **Balance Sheet**: View assets/liabilities
   - **Summary**: Financial overview

## 🎯 Key Features at a Glance

| Feature | Access | What it does |
|---------|--------|-------------|
| **Dashboard** | Home | See all stats and alerts |
| **New Sale** | New Sale button | Create invoices, track inventory |
| **Products** | Products menu | Add/edit inventory items |
| **Customers** | Customers menu | Manage parties & balances |
| **Reports** | Reports menu | View day book, balance sheet |
| **Settings** | Settings menu | Configure app behavior |

## 📱 Common Tasks

### Create Sale with Credit
```
New Sale → Select "Credit" → Pick Customer → Add Items → Save
✓ Customer balance updates automatically
✓ Stock decreases automatically
```

### Check What You're Owed
```
Dashboard → See "Receivables" stat
OR
Settings → Manage Data → See "Total Receivables"
```

### Export Daily Report
```
Reports → Day Book → Select Date → Click "Export CSV"
```

### Stop Negative Stock Sales
```
Settings → Toggle "Stop Sale on Negative Stock"
```

## ⚡ Keyboard Shortcuts (Coming Soon)
- `Ctrl + S` - Save/Submit
- `Ctrl + N` - New Record
- `Ctrl + E` - Export
- `Ctrl + P` - Print

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| App won't load | Restart dev server: `npm run dev` |
| No data showing | Check JSON Server: `npm run json-server` |
| Can't save sale | Ensure payment mode & customer selected |
| Stock not updating | Refresh page or wait a moment |

## 📞 Default Data

```
Business: Acme Traders (GSTIN: 29ABCDE1234F2Z5)

Products:
- Widget A (₹199, Stock: 100)
- Widget B (₹299, Stock: 50)
- Widget C (₹149, Stock: 75)

Customers:
- Ravi (Phone: 9999999999)
- Priya (Phone: 8888888888)
- Amit (Phone: 7777777777)
```

## 🔄 Workflow Example

**Complete Sales Workflow:**
```
1. Dashboard → See day stats
2. New Sale → Add items for customer
3. Save → Updates stock & customer balance
4. Reports → View all transactions
5. Settings → Configure next preferences
```

## 💡 Pro Tips

1. **Stock Check** - Always check products page before running low
2. **Credit Tracking** - Monitor receivables in dashboard
3. **Daily Backup** - Export reports at end of day
4. **Tax Rates** - 0% (no tax), 5%, 12%, 18%, 28% available
5. **Round Off** - Enable for invoices ≤₹2000

---

Ready to use! 🚀 Check **SETUP_GUIDE.md** for detailed documentation.
