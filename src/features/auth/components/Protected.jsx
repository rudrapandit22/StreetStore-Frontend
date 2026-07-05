import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

const Protected = ({ children, requiredRole }) => {
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)

  // Wait for session restore to complete before making any decision
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#6B5A47] text-sm">Loading...</div>
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role-gated route — wrong role → send to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default Protected
