'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { Building2, MapPin, Users, TrendingUp, Eye, Phone } from 'lucide-react'

interface PhysicalStore {
  entity_platform_id: string
  entity_name: string
  organization_name: string
  store_type: string
  location: string
  subscription_status: string
  monthly_revenue: number
  staff_count: number
  last_activity: string
  is_active: boolean
}

export default function PhysicalStoresPage() {
  const [stores, setStores] = useState<PhysicalStore[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalRevenue: 0,
    totalStaff: 0
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      // Mock data
      const storeData: PhysicalStore[] = [
        {
          entity_platform_id: 'store_001',
          entity_name: 'Downtown Pet Plaza',
          organization_name: 'Urban Pet Solutions',
          store_type: 'Full Service',
          location: 'New York, NY',
          subscription_status: 'active',
          monthly_revenue: 12000,
          staff_count: 8,
          last_activity: new Date().toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'store_002',
          entity_name: 'Suburban Pet Corner',
          organization_name: 'Family Pet Care',
          store_type: 'Retail Only',
          location: 'Austin, TX',
          subscription_status: 'active',
          monthly_revenue: 8500,
          staff_count: 5,
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'store_003',
          entity_name: 'Pet Grooming & More',
          organization_name: 'Grooming Specialists Inc',
          store_type: 'Grooming + Retail',
          location: 'Miami, FL',
          subscription_status: 'active',
          monthly_revenue: 15000,
          staff_count: 12,
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]

      setStores(storeData)

      // Calculate stats
      const activeStores = storeData.filter(s => s.is_active)
      const totalRevenue = storeData.reduce((sum, s) => sum + s.monthly_revenue, 0)
      const totalStaff = storeData.reduce((sum, s) => sum + s.staff_count, 0)

      setStats({
        totalStores: storeData.length,
        activeStores: activeStores.length,
        totalRevenue,
        totalStaff
      })

    } catch (error) {
      console.error('Error fetching physical stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return variants[status as keyof typeof variants] || variants.inactive
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-800 bg-clip-text text-transparent">
                Physical Stores
              </h1>
              <p className="text-amber-600">Brick & mortar retail location management</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stores</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.totalStores}</p>
                </div>
                <Building2 className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Locations</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeStores}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
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
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalStaff}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stores List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Physical Store Locations ({stores.length})
              </span>
              <Button onClick={fetchStores} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              All brick & mortar pet retail locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No physical stores found
              </div>
            ) : (
              <div className="space-y-4">
                {stores.map((store) => (
                  <div key={store.entity_platform_id} 
                       className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {store.entity_name?.charAt(0).toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{store.entity_name}</h3>
                          <p className="text-sm text-gray-500">{store.organization_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {store.location}
                        </span>
                        <span>Type: {store.store_type}</span>
                        <span>Staff: {store.staff_count}</span>
                        <span>Revenue: ${store.monthly_revenue.toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(store.subscription_status)}>
                        {store.subscription_status}
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