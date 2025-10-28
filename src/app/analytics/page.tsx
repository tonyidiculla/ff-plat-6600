'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { TrendingUp, BarChart3, PieChart, Activity, Download, Calendar, Users, DollarSign } from 'lucide-react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last_30_days')
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      total: 1250000,
      growth: 15.3,
      trend: 'up'
    },
    users: {
      total: 12450,
      active: 8930,
      growth: 8.7
    },
    subscriptions: {
      total: 456,
      new: 23,
      churn: 2.1
    },
    entityBreakdown: {
      hospitals: 187,
      eStores: 156,
      physicalStores: 89,
      channelPartners: 24
    }
  })

  const topPerformers = [
    { name: 'Metropolitan Health Group', revenue: 45000, entities: 8, growth: 22.5 },
    { name: 'PawMart Retail Group', revenue: 38000, entities: 12, growth: 18.2 },
    { name: 'Children Health Network', revenue: 34000, entities: 5, growth: 15.8 },
    { name: 'Pet Care Solutions', revenue: 28000, entities: 7, growth: 12.3 },
    { name: 'Urban Pet Solutions', revenue: 25000, entities: 4, growth: 9.7 }
  ]

  const revenueByModule = [
    { module: 'HMS Core', revenue: 456000, percentage: 36.5 },
    { module: 'E-Store Platform', revenue: 312000, percentage: 25.0 },
    { module: 'Physical Store POS', revenue: 187000, percentage: 15.0 },
    { module: 'Channel Partner Network', revenue: 156000, percentage: 12.5 },
    { module: 'Advanced Analytics', revenue: 139000, percentage: 11.0 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-800 bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
                <p className="text-indigo-600">Platform insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="last_year">Last Year</option>
              </select>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">${(analyticsData.revenue.total / 1000).toFixed(0)}K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+{analyticsData.revenue.growth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Active Users</p>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.users.active.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">+{analyticsData.users.growth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Subscriptions</p>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.subscriptions.total}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-purple-600">+{analyticsData.subscriptions.new} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Churn Rate</p>
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.subscriptions.churn}%</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-500">Industry avg: 3.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Entity Breakdown */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Entity Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of entities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-emerald-800">HMS Hospitals</span>
                  <span className="text-2xl font-bold text-emerald-700">{analyticsData.entityBreakdown.hospitals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">E-Stores</span>
                  <span className="text-2xl font-bold text-purple-700">{analyticsData.entityBreakdown.eStores}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">Physical Stores</span>
                  <span className="text-2xl font-bold text-amber-700">{analyticsData.entityBreakdown.physicalStores}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Channel Partners</span>
                  <span className="text-2xl font-bold text-blue-700">{analyticsData.entityBreakdown.channelPartners}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Module */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue by Module
              </CardTitle>
              <CardDescription>
                Revenue contribution by platform modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByModule.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{item.module}</span>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">${(item.revenue / 1000).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Organizations */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Organizations
            </CardTitle>
            <CardDescription>
              Organizations with highest revenue and growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((org, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">{org.entities} entities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${org.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+{org.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}