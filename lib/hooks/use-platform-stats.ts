'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface PlatformStats {
  totalOrganizations: number
  totalUsers: number
  totalHospitals: number
  totalEStores: number
  totalPhysicalStores: number
  totalChannelPartners: number
  activeUsers: number
  systemUptime: number
  monthlyRevenue: number
}

const MOCK_STATS: PlatformStats = {
  totalOrganizations: 2,
  totalUsers: 12,
  totalHospitals: 3,
  totalEStores: 1,
  totalPhysicalStores: 0,
  totalChannelPartners: 1,
  activeUsers: 8,
  systemUptime: 99.2,
  monthlyRevenue: 598,
}

const ENABLE_REAL_STATS = process.env.NEXT_PUBLIC_ENABLE_REAL_STATS === 'true'

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>(ENABLE_REAL_STATS ? {
    totalOrganizations: 0,
    totalUsers: 0,
    totalHospitals: 0,
    totalEStores: 0,
    totalPhysicalStores: 0,
    totalChannelPartners: 0,
    activeUsers: 0,
    systemUptime: 99.2,
    monthlyRevenue: 0
  } : MOCK_STATS)
  const [loading, setLoading] = useState(ENABLE_REAL_STATS)
  const [error, setError] = useState<string | null>(null)

  const fetchPlatformStats = async () => {
    if (!ENABLE_REAL_STATS) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('[chart] Fetching platform statistics from public...')

      // Get current authenticated user to verify we're connected
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('[OK] User authenticated, loading real data...')
        
        // Fetch real counts from public schema
        const masterDataClient = (supabase as any).schema('public')

        const [
          organizationsResult,
          profilesResult,
          hospitalsResult,
          petsResult
        ] = await Promise.all([
          masterDataClient.from('organizations').select('id', { count: 'exact', head: true }),
          masterDataClient.from('profiles').select('id', { count: 'exact', head: true }),
          masterDataClient.from('hospital_master').select('id', { count: 'exact', head: true }),
          masterDataClient.from('pets').select('id', { count: 'exact', head: true })
        ])

        const queryErrors = [
          organizationsResult.error,
          profilesResult.error,
          hospitalsResult.error,
          petsResult.error
        ].filter(Boolean)

        if (queryErrors.length > 0) {
          throw queryErrors[0]
        }

        // Calculate stats from actual data
        const totalOrganizations = organizationsResult.count || 0
        const totalUsers = profilesResult.count || 0
        const totalHospitals = hospitalsResult.count || 0
        const totalPets = petsResult.count || 0
        
        // Calculate estimated revenue (example: $299 per organization per month)
        const monthlyRevenue = totalOrganizations * 299

        const realStats = {
          totalOrganizations,
          totalUsers,
          totalHospitals,
          totalEStores: 0, // TODO: Add when e_stores table is created
          totalPhysicalStores: 0, // TODO: Add when physical_stores table is created
          totalChannelPartners: 0, // TODO: Add when channel_partners table is created
          activeUsers: totalUsers, // For now, assume all users are active
          systemUptime: 99.2, // This would come from monitoring service
          monthlyRevenue
        }

        setStats(realStats)
        
        console.log('[OK] Platform stats loaded:', {
          organizations: totalOrganizations,
          users: totalUsers,
          hospitals: totalHospitals,
          pets: totalPets,
          revenue: monthlyRevenue
        })
      } else {
        console.warn('[warn] No authenticated user, using default stats')
        setStats({
          totalOrganizations: 0,
          totalUsers: 0,
          totalHospitals: 0,
          totalEStores: 0,
          totalPhysicalStores: 0,
          totalChannelPartners: 0,
          activeUsers: 0,
          systemUptime: 0,
          monthlyRevenue: 0
        })
      }

    } catch (err) {
      console.error('[ERROR] Error fetching platform stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load platform statistics')
      
      // Set minimal fallback values
      setStats({
        totalOrganizations: 1,
        totalUsers: 1,
        totalHospitals: 1,
        totalEStores: 0,
        totalPhysicalStores: 0,
        totalChannelPartners: 0,
        activeUsers: 1,
        systemUptime: 99.2,
        monthlyRevenue: 299
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchPlatformStats
  }
}