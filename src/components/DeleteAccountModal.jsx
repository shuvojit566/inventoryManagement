import React, { useState } from 'react'
import { AlertTriangle, Loader } from 'lucide-react'
import useStore from '../store/useStore'

export default function DeleteAccountModal({ isOpen, onClose, userData }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const store = useStore()

  const handleDelete = async () => {
    setError('')
    if (!password) {
      setError('Please enter your password to confirm deletion.')
      return
    }

    setLoading(true)
    try {
      await store.deleteAccount(password)
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.')
      setPassword('')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Delete Account</h2>
            <p className="text-xs text-red-700 mt-1">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-red-900">⚠️ Important:</p>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• This action is <strong>permanent</strong> and cannot be reversed</li>
              <li>• All your data will be <strong>permanently deleted</strong></li>
              <li>• This includes:</li>
              <li className="ml-4">- Your account profile and business information</li>
              <li className="ml-4">- {userData?.products || 0} products</li>
              <li className="ml-4">- {userData?.customers || 0} customers</li>
              <li className="ml-4">- {userData?.sales || 0} sales records</li>
              <li className="ml-4">- {userData?.purchases || 0} purchase records</li>
              <li className="ml-4">- {userData?.expenses || 0} expense records</li>
              <li>• Deleted data <strong>cannot be recovered</strong></li>
            </ul>
          </div>

          {/* Confirmation Text */}
          <div>
            <p className="text-sm text-gray-700 mb-3">
              To permanently delete your account, please enter your current password:
            </p>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter your current password"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:bg-gray-100 disabled:text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !password}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account Permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
