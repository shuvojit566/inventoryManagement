import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, Smartphone } from 'lucide-react'
import useStore from '../store/useStore'

export default function Login() {
  const store = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState(null)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (store.currentUser) {
      navigate(from, { replace: true })
    }
  }, [store.currentUser, from, navigate])

  const handleSubmit = async event => {
    event.preventDefault()
    setMessage(null)
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email and password.' })
      return
    }

    try {
      await store.login({ email: email.trim().toLowerCase(), password, remember })
      navigate(from, { replace: true })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white px-8 py-10 shadow-lg ring-1 ring-slate-200">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Welcome back</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="mt-3 text-sm text-slate-500">Access your inventory dashboard and business records securely.</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-2 relative rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
              <label className="inline-flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-sky-600 hover:text-sky-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={store.authLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {store.authLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Create one
            </Link>
            <span className="text-slate-400"> • </span>
            <Link to="/admin/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
