import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Smartphone, Lock } from 'lucide-react'
import { resetPassword } from '../utils/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async event => {
    event.preventDefault()
    setMessage(null)
    if (!email.trim() || !phone.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage({ type: 'error', text: 'Please complete all fields.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setMessage({ type: 'error', text: 'Phone number must have exactly 10 digits.' })
      return
    }

    setLoading(true)
    try {
      await resetPassword({ email: email.trim().toLowerCase(), phone: phone.replace(/\D/g, ''), newPassword })
      setMessage({ type: 'success', text: 'Password reset successful. Please sign in with your new password.' })
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white px-8 py-10 shadow-lg ring-1 ring-slate-200">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Reset your password</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Forgot password</h1>
            <p className="mt-3 text-sm text-slate-500">Enter your registered email and phone number to reset your password.</p>
          </div>

          {message && (
            <div className={`mb-4 rounded-xl border p-4 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-2 relative rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Registered phone number</label>
              <div className="mt-2 relative rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Smartphone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                  placeholder="10 digits"
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">New password</label>
              <div className="mt-2 relative rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                  placeholder="Choose a strong password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="mt-2 relative rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
