import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import SaleNew from './pages/SaleNew'
import PurchaseNew from './pages/PurchaseNew'
import TransactionHistory from './pages/TransactionHistory'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ProductsManagement from './pages/ProductsManagement'
import CustomersManagement from './pages/CustomersManagement'
import BillView from './pages/BillView'

export default function App(){
  return (
    <Routes>
      {/* Public bill view route - no sidebar/topbar */}
      <Route path="/bill/:token" element={<BillView/>} />
      
      {/* Dashboard */}
      <Route path="/" element={<MainLayout><Dashboard/></MainLayout>} />
      
      {/* Items Management */}
      <Route path="/items" element={<MainLayout><ProductsManagement/></MainLayout>} />
      
      {/* Parties Management */}
      <Route path="/parties" element={<MainLayout><CustomersManagement/></MainLayout>} />
      
      {/* New Sale */}
      <Route path="/sale/new" element={<MainLayout><SaleNew/></MainLayout>} />
      
      {/* New Purchase */}
      <Route path="/purchase/new" element={<MainLayout><PurchaseNew/></MainLayout>} />
      
      {/* Transactions History */}
      <Route path="/sales" element={<MainLayout><TransactionHistory type="sales"/></MainLayout>} />
      <Route path="/purchases" element={<MainLayout><TransactionHistory type="purchases"/></MainLayout>} />
      
      {/* Reports */}
      <Route path="/reports" element={<MainLayout><Reports/></MainLayout>} />
      
      {/* Settings */}
      <Route path="/settings" element={<MainLayout><Settings/></MainLayout>} />
    </Routes>
  )
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 overflow-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

