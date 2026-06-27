import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import SaleNew from './pages/SaleNew'
import PurchaseNew from './pages/PurchaseNew'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ProductsManagement from './pages/ProductsManagement'
import CustomersManagement from './pages/CustomersManagement'

export default function App(){
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/items" element={<ProductsManagement/>} />
            <Route path="/parties" element={<CustomersManagement/>} />
            <Route path="/sale/new" element={<SaleNew/>} />
            <Route path="/purchase/new" element={<PurchaseNew/>} />
            <Route path="/reports" element={<Reports/>} />
            <Route path="/settings" element={<Settings/>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

