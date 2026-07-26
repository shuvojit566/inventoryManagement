import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Register() {
  const store = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gstNumber: '',
    businessAddress: '',
    businessType: '',
    logoUrl: '',
    remember: true,
  })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (store.currentUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [store.currentUser, navigate])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validatePhone = phone => /^\d{10}$/.test(phone.replace(/\D/g, ''))

  const handleSubmit = async event => {
    event.preventDefault()
    setMessage(null)

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim() || !form.phone.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    if (!validatePhone(form.phone)) {
      setMessage({ type: 'error', text: 'Phone number must contain exactly 10 digits.' })
      return
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    try {
      await store.register({
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ''),
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white px-8 py-10 shadow-lg ring-1 ring-slate-200">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Create your business account</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Register for EasyInventory</h1>
            <p className="mt-3 text-sm text-slate-500">Create an account and keep your inventory, invoices, and reports safe and isolated.</p>
          </div>

          {message && (
            <div className={`mb-4 rounded-xl border p-4 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Business Name *</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Mobile Number *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10 digits"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700">GST Number</label>
              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Business Address</label>
              <textarea
                name="businessAddress"
                value={form.businessAddress}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Business Type</label>
              <input
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Business Logo URL</label>
              <input
                name="logoUrl"
                value={form.logoUrl}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Keep me signed in
              </label>
            </div>
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={store.authLoading}
                className="w-full rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {store.authLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
