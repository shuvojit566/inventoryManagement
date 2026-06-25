import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { Check, AlertCircle } from 'lucide-react'

export default function SettingsPanel() {
  const { settings, updateSettings } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isDirty, setIsDirty] = useState(false)
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
    setIsDirty(false)
  }, [settings])

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }))
    setIsDirty(true)
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(localSettings)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setIsDirty(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to save: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setIsDirty(false)
    setMessage(null)
  }

  const SettingToggle = ({ label, description, setting, onChange }) => (
    <div className="flex items-start justify-between py-3 border-b hover:bg-gray-50 px-2 rounded transition">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <input
        type="checkbox"
        checked={setting}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 accent-sky-600 cursor-pointer flex-shrink-0"
      />
    </div>
  )

  const SettingSelect = ({ label, description, setting, onChange, options }) => (
    <div className="py-3 border-b hover:bg-gray-50 px-2 rounded transition">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <select
        value={setting}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Alert Messages */}
      {message && (
        <div
          className={`px-4 py-3 flex items-start gap-3 border-b ${
            message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* General Settings Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            General Settings
          </h3>
          <div className="space-y-1">
            <SettingToggle
              label="Require GSTIN Number"
              description="Force users to enter GSTIN for businesses"
              setting={localSettings.requireGSTIN}
              onChange={val => handleSettingChange('requireGSTIN', val)}
            />
            <SettingToggle
              label="Stop Sale on Negative Stock"
              description="Prevent sales if product stock goes negative"
              setting={localSettings.stopOnNegativeStock}
              onChange={val => handleSettingChange('stopOnNegativeStock', val)}
            />
            <SettingToggle
              label="Enable Passcode Lock"
              description="Require passcode to access application"
              setting={localSettings.passcodeLock}
              onChange={val => handleSettingChange('passcodeLock', val)}
            />
            <SettingToggle
              label="Enable Audit Trail"
              description="Log all user actions for audit purposes"
              setting={localSettings.auditTrail}
              onChange={val => handleSettingChange('auditTrail', val)}
            />
          </div>
        </div>

        {/* Print Settings Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Print & Display Settings
          </h3>
          <SettingSelect
            label="Print Theme"
            description="Choose the theme for invoice printing"
            setting={localSettings.printTheme}
            onChange={val => handleSettingChange('printTheme', val)}
            options={[
              { value: 'GST Theme 1', label: 'GST Theme 1' },
              { value: 'GST Theme 2', label: 'GST Theme 2' },
              { value: 'Minimal', label: 'Minimal' },
              { value: 'Landscape', label: 'Landscape' },
            ]}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded font-medium transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded font-medium transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

