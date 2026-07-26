import React, { useEffect, useState } from 'react'
import useStore from '../store/useStore'

export default function Profile() {
  const store = useStore()
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    gstNumber: '',
    businessAddress: '',
    businessType: '',
    logoUrl: '',
    invoicePrefix: '',
    currency: '',
    taxSettings: '',
  })
  const [changed, setChanged] = useState(false)
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (store.currentUser) {
      const {
        fullName,
        businessName,
        email,
        phone,
        gstNumber,
        businessAddress,
        businessType,
        logoUrl,
        invoicePrefix,
        currency,
        taxSettings,
      } = store.currentUser
      setProfile({
        fullName: fullName || '',
        businessName: businessName || '',
        email: email || '',
        phone: phone || '',
        gstNumber: gstNumber || '',
        businessAddress: businessAddress || '',
        businessType: businessType || '',
        logoUrl: logoUrl || '',
        invoicePrefix: invoicePrefix || 'INV',
        currency: currency || 'INR',
        taxSettings: taxSettings || 'GST',
      })
    }
  }, [store.currentUser])

  const handleChange = event => {
    const { name, value } = event.target
    setProfile(prev => ({ ...prev, [name]: value }))
    setChanged(true)
  }

  const handleSave = async event => {
    event.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      const updated = await store.updateProfile(profile)
      setProfile(prev => ({ ...prev, ...updated }))
      setChanged(false)
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async event => {
    event.preventDefault()
    setPasswordMessage(null)
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter and confirm a new password.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPasswordLoading(true)
    try {
      await store.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Profile & business settings</h1>
            <p className="text-sm text-slate-600">Update account information, business details, and invoice defaults.</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl border p-4 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Business Name</label>
            <input
              name="businessName"
              value={profile.businessName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Business Address</label>
            <textarea
              name="businessAddress"
              value={profile.businessAddress}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">GST Number</label>
            <input
              name="gstNumber"
              value={profile.gstNumber}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Business Type</label>
            <input
              name="businessType"
              value={profile.businessType}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Invoice Prefix</label>
            <input
              name="invoicePrefix"
              value={profile.invoicePrefix}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Currency</label>
            <input
              name="currency"
              value={profile.currency}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Business Logo URL</label>
            <input
              name="logoUrl"
              value={profile.logoUrl}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Tax Settings</label>
            <select
              name="taxSettings"
              value={profile.taxSettings}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="GST">GST</option>
              <option value="VAT">VAT</option>
              <option value="None">None</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={saving || !changed}
              className="w-full rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Saving profile...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Change your password</h2>
          <p className="mt-2 text-sm text-slate-600">Keep your account secure by updating your password periodically.</p>
        </div>

        {passwordMessage && (
          <div className={`mb-6 rounded-xl border p-4 text-sm ${passwordMessage.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4 lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-4 lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {passwordLoading ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
