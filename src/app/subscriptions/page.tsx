'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandardizedHeaderWithSuspense } from "@/components/ui/standardized-header-with-suspense"
import { usePlatformStats } from "@/lib/hooks/use-platform-stats"
import { Building, ArrowRight, Loader2, CreditCard, Store, ShoppingBag } from "lucide-react"

const SubscriptionsPage = () => {
  const { stats, loading, error } = usePlatformStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn('Platform stats error:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 dark:from-blue-900 dark:via-slate-900/60 dark:to-red-900/40">
      {/* Standardized Header */}
      <StandardizedHeaderWithSuspense />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-pink-600/15 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
                      Subscription Management
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Manage HMS, E-Stores, and Physical Store subscriptions
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-2 text-base">
                  {stats.totalHospitals + stats.totalEStores + stats.totalPhysicalStores} Total Modules
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="hms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="hms" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              HMS
            </TabsTrigger>
            <TabsTrigger value="estores" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              E-Stores
            </TabsTrigger>
            <TabsTrigger value="pstores" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Physical Stores
            </TabsTrigger>
          </TabsList>

          {/* HMS Tab */}
          <TabsContent value="hms" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-emerald-700 to-emerald-800 bg-clip-text text-transparent">
                      Hospital Management System
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      Veterinary Clinics & Hospitals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-600">Active Hospitals</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                    {stats.totalHospitals} Active
                  </Badge>
                </div>
                <Progress value={92} className="h-2 bg-emerald-100" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700">{stats.totalHospitals}</div>
                    <div className="text-xs text-emerald-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">Inactive</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href="/hms" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all">
                      Manage Hospitals <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-Stores Tab */}
          <TabsContent value="estores" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-purple-800 bg-clip-text text-transparent">
                      E-Store Management
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Online Pet Product Stores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Online Stores</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                    {stats.totalEStores} Live
                  </Badge>
                </div>
                <Progress value={78} className="h-2 bg-purple-100" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{stats.totalEStores}</div>
                    <div className="text-xs text-purple-600">Live</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">In Setup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">Suspended</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href="/e-stores" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage E-Stores <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Stores Tab */}
          <TabsContent value="pstores" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-amber-700 to-amber-800 bg-clip-text text-transparent">
                      Physical Store Management
                    </CardTitle>
                    <CardDescription className="text-amber-600">
                      Brick & Mortar Retail Locations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-600">Store Locations</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
                    {stats.totalPhysicalStores} Open
                  </Badge>
                </div>
                <Progress value={85} className="h-2 bg-amber-100" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-700">{stats.totalPhysicalStores}</div>
                    <div className="text-xs text-amber-600">Open</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">Opening Soon</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">0</div>
                    <div className="text-xs text-gray-500">Closed</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href="/physical-stores" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage Stores <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}

export default SubscriptionsPage
