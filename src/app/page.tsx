import { Suspense } from 'react'
import { Metadata } from 'next'
import PlatformDashboard from '../../components/dashboard/PlatformDashboard'
import { Loader2, PawPrint } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Platform Admin Portal - Pet Management Ecosystem',
  description: 'Platform administration dashboard for managing organizations, users, and platform-wide settings',
}

// Loading component for suspense boundary
// Matches the dashboard background to prevent flash
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600 mt-3">Loading platform...</p>
    </div>
  )
}

// Main platform dashboard page
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PlatformDashboard />
    </Suspense>
  )
}