import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetails from './pages/AdminUserDetails'
import AdminSettings from './pages/AdminSettings'
import useStore from './store/useStore'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <GuestGuard>
            <Login />
          </GuestGuard>
        }
      />
      <Route
        path="/register"
        element={
          <GuestGuard>
            <Register />
          </GuestGuard>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/bill/:token" element={<BillView />} />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={
          <AdminGuestGuard>
            <AdminLogin />
          </AdminGuestGuard>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <AdminProtectedRoute>
            <AdminUserDetails />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProductsManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parties"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CustomersManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sale/new"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SaleNew />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/new"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PurchaseNew />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TransactionHistory type="sales" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TransactionHistory type="purchases" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ProtectedRoute({ children }) {
  const currentUser = useStore(state => state.currentUser)
  const location = useLocation()
  if (!currentUser || currentUser.role === 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function AdminProtectedRoute({ children }) {
  const currentUser = useStore(state => state.currentUser)
  const location = useLocation()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}

function GuestGuard({ children }) {
  const currentUser = useStore(state => state.currentUser)
  if (currentUser && currentUser.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AdminGuestGuard({ children }) {
  const currentUser = useStore(state => state.currentUser)
  if (currentUser && currentUser.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  )
}

export default App
