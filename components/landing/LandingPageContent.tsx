'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PawPrint, 
  Users, 
  Building, 
  Store, 
  UserCheck, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LandingPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }

  const features = [
    {
      icon: Building,
      title: "Multi-Entity Management",
      description: "Manage hospitals, e-stores, physical stores, and channel partners from one platform"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure user management with granular permissions and role-based access control"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive reporting and analytics across all your business entities"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with multi-tenant architecture and data isolation"
    },
    {
      icon: Zap,
      title: "Modular Subscriptions",
      description: "Pay only for what you use with flexible module-based subscription plans"
    },
    {
      icon: UserCheck,
      title: "Seamless Integration",
      description: "Unified data flow between all applications in the pet management ecosystem"
    }
  ]

  const stats = [
    { label: "Active Organizations", value: "500+", color: "bg-blue-500" },
    { label: "Managed Entities", value: "2,000+", color: "bg-green-500" },
    { label: "Platform Users", value: "10,000+", color: "bg-purple-500" },
    { label: "Daily Transactions", value: "50,000+", color: "bg-orange-500" }
  ]

  const entityTypes = [
    {
      name: "HMS",
      description: "Hospital Management System",
      icon: "[hospital]"
    },
    {
      name: "E-Store",
      description: "Online Pet Products",
      icon: "[cart]"
    },
    {
      name: "Physical Store",
      description: "Brick & Mortar Retail",
      icon: "[store]"
    },
    {
      name: "Channel Partner",
      description: "Third-party Services",
      icon: "[handshake]"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <PawPrint className="h-8 w-8 animate-pulse text-blue-600" />
          <span className="text-lg font-medium">Loading Platform Admin Portal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <PawPrint className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">
              Pet Management <span className="text-blue-600">Platform</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive administrative portal for managing the entire pet care ecosystem. 
            Control organizations, entities, subscriptions, and platform-wide settings from one unified dashboard.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => router.push('/auth/signup')}
                className="px-8 py-3 text-lg"
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className={`inline-block w-3 h-3 rounded-full ${stat.color} mb-2`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Entity Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Manage All Entity Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {entityTypes.map((entity, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{entity.icon}</div>
                  <CardTitle className="text-xl">{entity.name}</CardTitle>
                  <CardDescription>{entity.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Unified data across all applications</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Scalable multi-tenant architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Flexible module-based subscriptions</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Enterprise-grade security</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Seamless integration ecosystem</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">24/7 platform monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg">Comprehensive admin controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to manage your pet care platform?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of organizations already using our platform to streamline their operations.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg"
          >
            {isAuthenticated ? 'Access Dashboard' : 'Start Your Journey'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}