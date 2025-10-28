'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandardizedHeader } from "@/components/ui/standardized-header"
import { usePlatformStats } from "@/lib/hooks/use-platform-stats"
import { Building, CreditCard, PawPrint, Settings, ArrowRight, Handshake, FileText, Users, MessageCircle, Ticket, TrendingUp, Bell, Loader2, Heart } from "lucide-react"


const PlatformDashboard = () => {
  const { stats, loading, error } = usePlatformStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading platform statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn('Platform stats error:', error)
    // Continue rendering with default stats rather than showing error to user
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 dark:from-blue-900 dark:via-slate-900/60 dark:to-red-900/40">
      {/* Standardized Platform Header */}
      <StandardizedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Quick Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-red-600/15 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-xl border-green-200/60">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-blue-700 bg-clip-text text-transparent">Platform Overview</h2>
              </div>
              
              {/* All Stats in One Row */}
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <div className="text-xl font-bold text-blue-700">{stats.totalOrganizations}</div>
                  <div className="text-xs text-blue-500">Organizations</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-green-700">{stats.totalHospitals}</div>
                  <div className="text-xs text-green-500">Hospitals</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-purple-700">{stats.totalEStores}</div>
                  <div className="text-xs text-purple-500">E-Stores</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-amber-700">{stats.totalPhysicalStores}</div>
                  <div className="text-xs text-amber-500">Stores</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-emerald-700">${(stats.monthlyRevenue / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-emerald-500">Revenue</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-orange-700">{stats.activeUsers.toLocaleString()}</div>
                  <div className="text-xs text-orange-500">Users</div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-blue-200 mx-2" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-rose-700">{stats.systemUptime}%</div>
                  <div className="text-xs text-rose-500">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid of Application Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* User Management */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-rose-700 to-rose-800 bg-clip-text text-transparent">Users</CardTitle>
                    <CardDescription className="text-rose-600">Account Management</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-rose-600">Total Users</span>
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200">
                    {stats.totalUsers.toLocaleString()} Users
                  </Badge>
                </div>
                <Progress value={87} className="h-2 bg-rose-100" />
                <div className="flex gap-2">
                  <Link href="/users" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pet Management */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-pink-700 to-pink-800 bg-clip-text text-transparent">Pet Management</CardTitle>
                    <CardDescription className="text-pink-600">Registry, Medical Records & Species</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pink-600">Registered Pets</span>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200">
                    12.5K Pets
                  </Badge>
                </div>
                <Progress value={88} className="h-2 bg-pink-100" />
                <div className="flex gap-2">
                  <Link href="/pets" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage Pets <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-indigo-700 to-indigo-800 bg-clip-text text-transparent">Subscriptions</CardTitle>
                    <CardDescription className="text-indigo-600">Module Management</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Active Modules</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200">
                    {stats.totalHospitals + stats.totalEStores + stats.totalPhysicalStores} Total
                  </Badge>
                </div>
                <Progress value={85} className="h-2 bg-indigo-100" />
                <div className="flex gap-2">
                  <Link href="/subscriptions" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Partners */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Handshake className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">Channel Partners</CardTitle>
                    <CardDescription className="text-blue-600">Third-party Network</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Active Partners</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                    12 Connected
                  </Badge>
                </div>
                <Progress value={65} className="h-2 bg-blue-100" />
                <div className="flex gap-2">
                  <Link href="/channel-partners" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Administration */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">System Admin</CardTitle>
                    <CardDescription className="text-slate-600">Platform Configuration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">System Health</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                    99.2% Up
                  </Badge>
                </div>
                <Progress value={99} className="h-2 bg-slate-100" />
                <div className="flex gap-2">
                  <Link href="/admin" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all">
                      Configure <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support & Tickets */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">Support</CardTitle>
                    <CardDescription className="text-teal-600">Help & Tickets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-600">Open Tickets</span>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200">
                    23 Active
                  </Badge>
                </div>
                <Progress value={73} className="h-2 bg-teal-100" />
                <div className="flex gap-2">
                  <Link href="/support" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all">
                      View Tickets <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics & Reports */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative border-0 bg-green-50/95 dark:bg-green-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] border-green-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-indigo-700 to-indigo-800 bg-clip-text text-transparent">Analytics</CardTitle>
                    <CardDescription className="text-indigo-600">Reports & Insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Data Points</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200">
                    Real-time
                  </Badge>
                </div>
                <Progress value={94} className="h-2 bg-indigo-100" />
                <div className="flex gap-2">
                  <Link href="/analytics" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all">
                      View Reports <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}

export default PlatformDashboard