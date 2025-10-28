'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { Handshake, Network, DollarSign, Users, Eye, Phone, Mail } from 'lucide-react'

interface ChannelPartner {
  entity_platform_id: string
  entity_name: string
  organization_name: string
  partner_type: string
  partnership_level: string
  subscription_status: string
  commission_rate: number
  monthly_referrals: number
  total_revenue: number
  last_activity: string
  is_active: boolean
}

export default function ChannelPartnersPage() {
  const [partners, setPartners] = useState<ChannelPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    totalReferrals: 0,
    totalCommissions: 0
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      // Mock data
      const partnerData: ChannelPartner[] = [
        {
          entity_platform_id: 'partner_001',
          entity_name: 'VetTech Solutions',
          organization_name: 'VetTech Solutions LLC',
          partner_type: 'Technology Partner',
          partnership_level: 'Gold',
          subscription_status: 'active',
          commission_rate: 15,
          monthly_referrals: 8,
          total_revenue: 45000,
          last_activity: new Date().toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'partner_002',
          entity_name: 'Pet Insurance Pro',
          organization_name: 'Insurance Partners Inc',
          partner_type: 'Insurance Partner',
          partnership_level: 'Silver',
          subscription_status: 'active',
          commission_rate: 12,
          monthly_referrals: 15,
          total_revenue: 67000,
          last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          entity_platform_id: 'partner_003',
          entity_name: 'Pet Food Distributors',
          organization_name: 'Nutrition Partners Network',
          partner_type: 'Supply Partner',
          partnership_level: 'Bronze',
          subscription_status: 'active',
          commission_rate: 8,
          monthly_referrals: 25,
          total_revenue: 89000,
          last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]

      setPartners(partnerData)

      // Calculate stats
      const activePartners = partnerData.filter(p => p.is_active)
      const totalReferrals = partnerData.reduce((sum, p) => sum + p.monthly_referrals, 0)
      const totalCommissions = partnerData.reduce((sum, p) => sum + (p.total_revenue * p.commission_rate / 100), 0)

      setStats({
        totalPartners: partnerData.length,
        activePartners: activePartners.length,
        totalReferrals,
        totalCommissions
      })

    } catch (error) {
      console.error('Error fetching channel partners:', error)
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

  const getLevelBadge = (level: string) => {
    const variants = {
      Gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Silver: 'bg-gray-100 text-gray-800 border-gray-200',
      Bronze: 'bg-orange-100 text-orange-800 border-orange-200',
      Platinum: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return variants[level as keyof typeof variants] || variants.Bronze
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">
                Channel Partners
              </h1>
              <p className="text-blue-600">Third-party network and partnership management</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalPartners}</p>
                </div>
                <Handshake className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Partners</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activePartners}</p>
                </div>
                <Network className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Referrals</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-emerald-700">${(stats.totalCommissions / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Channel Partners ({partners.length})
              </span>
              <Button onClick={fetchPartners} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Third-party partners and referral network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {partners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No channel partners found
              </div>
            ) : (
              <div className="space-y-4">
                {partners.map((partner) => (
                  <div key={partner.entity_platform_id} 
                       className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {partner.entity_name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{partner.entity_name}</h3>
                          <p className="text-sm text-gray-500">{partner.organization_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>Type: {partner.partner_type}</span>
                        <span>Commission: {partner.commission_rate}%</span>
                        <span>Referrals: {partner.monthly_referrals}/mo</span>
                        <span>Revenue: ${partner.total_revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getLevelBadge(partner.partnership_level)}>
                        {partner.partnership_level}
                      </Badge>
                      <Badge className={getStatusBadge(partner.subscription_status)}>
                        {partner.subscription_status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Partner
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