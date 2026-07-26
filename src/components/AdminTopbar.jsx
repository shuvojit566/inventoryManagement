import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, User } from 'lucide-react'
import useStore from '../store/useStore'

export default function AdminTopbar() {
  const currentUser = useStore(state => state.currentUser)
  const navigate = useNavigate()

  const currentTime = new Date().toLocaleTimeString()

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-600">
        <Clock className="w-4 h-4" />
        <span className="text-sm">{currentTime}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
          <User className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{currentUser?.fullName}</span>
        </div>
      </div>
    </div>
  )
}
