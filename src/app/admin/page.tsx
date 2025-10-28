'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { Settings, Database, Shield, Server, Globe, Users, Activity, Cpu } from 'lucide-react'

export default function SystemAdminPage() {
  const [systemStats, setSystemStats] = useState({
    uptime: '99.8%',
    totalUsers: 1247,
    activeConnections: 342,
    databaseSize: '45.2 GB',
    apiCalls: 89234,
    errorRate: '0.02%'
  })

  const [services, setServices] = useState([
    { name: 'Database', status: 'healthy', uptime: '99.9%', icon: Database },
    { name: 'API Gateway', status: 'healthy', uptime: '99.8%', icon: Server },
    { name: 'Authentication', status: 'healthy', uptime: '100%', icon: Shield },
    { name: 'File Storage', status: 'warning', uptime: '98.5%', icon: Globe },
    { name: 'Background Jobs', status: 'healthy', uptime: '99.7%', icon: Cpu },
    { name: 'Real-time Updates', status: 'healthy', uptime: '99.4%', icon: Activity }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '(*)'
      case 'warning': return '[warn]'
      case 'error': return 'x'
      default: return '(o)'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                System Administration
              </h1>
              <p className="text-slate-600">Platform configuration and system management</p>
            </div>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">System Uptime</p>
                <p className="text-lg font-bold text-green-700">{systemStats.uptime}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Total Users</p>
                <p className="text-lg font-bold text-blue-700">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Active Connections</p>
                <p className="text-lg font-bold text-purple-700">{systemStats.activeConnections}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Database Size</p>
                <p className="text-lg font-bold text-amber-700">{systemStats.databaseSize}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">API Calls/Day</p>
                <p className="text-lg font-bold text-emerald-700">{systemStats.apiCalls.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Error Rate</p>
                <p className="text-lg font-bold text-red-700">{systemStats.errorRate}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Services Status */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Services
              </CardTitle>
              <CardDescription>
                Current status of all platform services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => {
                  const IconComponent = service.icon
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)} {service.status}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" className="justify-start h-12">
                  <Database className="h-4 w-4 mr-3" />
                  Database Management
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Users className="h-4 w-4 mr-3" />
                  User Management
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Shield className="h-4 w-4 mr-3" />
                  Security Settings
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Server className="h-4 w-4 mr-3" />
                  Server Configuration
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Globe className="h-4 w-4 mr-3" />
                  API Configuration
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Activity className="h-4 w-4 mr-3" />
                  System Monitoring
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Configuration */}
        <div className="mt-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Global platform settings and feature toggles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Feature Flags</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage platform-wide feature toggles</p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Email Templates</h3>
                  <p className="text-sm text-gray-600 mb-3">Customize system email templates</p>
                  <Button size="sm" variant="outline">Edit Templates</Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Rate Limits</h3>
                  <p className="text-sm text-gray-600 mb-3">Configure API rate limiting rules</p>
                  <Button size="sm" variant="outline">Manage Limits</Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Backup Settings</h3>
                  <p className="text-sm text-gray-600 mb-3">Configure automated backup schedules</p>
                  <Button size="sm" variant="outline">Setup Backups</Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Audit Logs</h3>
                  <p className="text-sm text-gray-600 mb-3">Review system activity and changes</p>
                  <Button size="sm" variant="outline">View Logs</Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Integration Settings</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage third-party integrations</p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}