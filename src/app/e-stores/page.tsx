'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { Store, TrendingUp, Package, DollarSign, Eye, Settings } from 'lucide-react'

interface EStore {
  entity_platform_id: string
  entity_name: string
  organization_name: string
  store_type: string
  subscription_status: string
  monthly_revenue: number
  total_products: number
  total_orders: number
  last_activity: string
  is_active: boolean
}

export default function EStoresManagementPage() {
  const router = useRouter()
  const [eStores, setEStores] = useState<EStore[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalRevenue: 0,
    totalProducts: 0
  })

  useEffect(() => {
    fetchEStores()
  }, [])

  const fetchEStores = async () => {
    try {
      // Mock data for now
      const eStoreData: EStore[] = [
        {
          entity_platform_id: 'estore_001',
          entity_name: 'PawMart Online',
          organization_name: 'PawMart Retail Group',
          store_type: 'Full Service',
          subscription_status: 'active',
          monthly_revenue: 15000,
          total_products: 245,
          total_orders: 189,
          last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'estore_002',
          entity_name: 'Pet Supplies Express',
          organization_name: 'Express Pet Solutions',
          store_type: 'Food & Supplies',
          subscription_status: 'active',
          monthly_revenue: 8500,
          total_products: 156,
          total_orders: 127,
          last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'estore_003',
          entity_name: 'Luxury Pet Boutique',
          organization_name: 'Premium Pet Care',
          store_type: 'Premium',
          subscription_status: 'active',
          monthly_revenue: 22000,
          total_products: 89,
          total_orders: 245,
          last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]

      setEStores(eStoreData)

      // Calculate stats
      const activeStores = eStoreData.filter(s => s.is_active)
      const totalRevenue = eStoreData.reduce((sum, s) => sum + s.monthly_revenue, 0)
      const totalProducts = eStoreData.reduce((sum, s) => sum + s.total_products, 0)

      setStats({
        totalStores: eStoreData.length,
        activeStores: activeStores.length,
        totalRevenue,
        totalProducts
      })

    } catch (error) {
      console.error('Error fetching e-stores:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-800 bg-clip-text text-transparent">
                E-Commerce Stores
              </h1>
              <p className="text-purple-600">Online pet retail store management</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total E-Stores</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalStores}</p>
                </div>
                <Store className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Stores</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeStores}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
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
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* E-Stores List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                E-Commerce Stores ({eStores.length})
              </span>
              <Button onClick={fetchEStores} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              All online pet retail stores on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eStores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No e-stores found
              </div>
            ) : (
              <div className="space-y-4">
                {eStores.map((store) => (
                  <div key={store.entity_platform_id} 
                       className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {store.entity_name?.charAt(0).toUpperCase() || 'E'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{store.entity_name}</h3>
                          <p className="text-sm text-gray-500">{store.organization_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Type: {store.store_type}</span>
                        <span>Products: {store.total_products}</span>
                        <span>Orders: {store.total_orders}</span>
                        <span>Revenue: ${store.monthly_revenue.toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(store.subscription_status)}>
                        {store.subscription_status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Store
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