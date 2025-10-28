'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { supabase } from '@/lib/supabase/client'
import { Building, Users, Calendar, TrendingUp, Settings, Eye } from 'lucide-react'

interface Hospital {
  entity_platform_id: string
  entity_name: string
  organization_name: string
  hospital_type: string
  subscription_status: string
  subscription_start_date: string
  subscription_end_date: string
  yearly_subscription_cost: number
  total_users: number
  last_activity: string
  is_active: boolean
}

export default function HMSManagementPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    avgUsers: 0
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      // Mock data for now since we need to understand the exact schema
      const hospitalData: Hospital[] = [
        {
          entity_platform_id: 'hosp_001',
          entity_name: 'City General Hospital',
          organization_name: 'Metropolitan Health Group',
          hospital_type: 'General',
          subscription_status: 'active',
          subscription_start_date: '2024-01-01',
          subscription_end_date: '2024-12-31',
          yearly_subscription_cost: 25000,
          total_users: 42,
          last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'hosp_002',
          entity_name: 'Pediatric Care Center',
          organization_name: 'Children Health Network',
          hospital_type: 'Pediatric',
          subscription_status: 'active',
          subscription_start_date: '2024-03-15',
          subscription_end_date: '2025-03-14',
          yearly_subscription_cost: 18000,
          total_users: 28,
          last_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'hosp_003',
          entity_name: 'Emergency Veterinary Clinic',
          organization_name: 'PetCare Solutions',
          hospital_type: 'Emergency',
          subscription_status: 'pending',
          subscription_start_date: '2024-06-01',
          subscription_end_date: '2025-05-31',
          yearly_subscription_cost: 15000,
          total_users: 15,
          last_activity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]

      setHospitals(hospitalData)

      // Calculate stats
      const activeHospitals = hospitalData.filter(h => h.is_active)
      const activeSubscriptions = hospitalData.filter(h => h.subscription_status === 'active')
      const totalRevenue = hospitalData.reduce((sum, h) => sum + (h.yearly_subscription_cost || 0), 0)
      const avgUsers = hospitalData.length > 0 ? 
        hospitalData.reduce((sum, h) => sum + h.total_users, 0) / hospitalData.length : 0

      setStats({
        totalHospitals: activeHospitals.length,
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue,
        avgUsers: Math.round(avgUsers)
      })

    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[status as keyof typeof variants] || variants.inactive
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-800 bg-clip-text text-transparent">
                Hospital Management System
              </h1>
              <p className="text-emerald-600">Platform-wide HMS oversight and management</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hospitals</p>
                  <p className="text-2xl font-bold text-emerald-700">{stats.totalHospitals}</p>
                </div>
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeSubscriptions}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annual Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Users/Hospital</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.avgUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospitals List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                HMS Hospitals ({hospitals.length})
              </span>
              <Button onClick={fetchHospitals} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              All hospitals subscribed to HMS across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-600">
                Error loading hospitals: {error}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hospitals found
              </div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital) => (
                  <div key={hospital.entity_platform_id} 
                       className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {hospital.entity_name?.charAt(0).toUpperCase() || 'H'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{hospital.entity_name}</h3>
                          <p className="text-sm text-gray-500">{hospital.organization_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Type: {hospital.hospital_type || 'General'}</span>
                        <span>Users: {hospital.total_users}</span>
                        <span>Revenue: ${hospital.yearly_subscription_cost?.toLocaleString() || 0}/yr</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(hospital.subscription_status)}>
                        {hospital.subscription_status || 'inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}