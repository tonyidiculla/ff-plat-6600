'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { Ticket, MessageSquare, Clock, CheckCircle, AlertCircle, User, Plus } from 'lucide-react'

interface SupportTicket {
  ticket_id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category: string
  user_name: string
  organization_name: string
  entity_name: string
  created_at: string
  updated_at: string
  assigned_to: string
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '2.4h'
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      // Mock data
      const ticketData: SupportTicket[] = [
        {
          ticket_id: 'TK-001',
          title: 'Unable to access HMS module',
          description: 'Getting error when trying to open patient records in HMS',
          priority: 'high',
          status: 'open',
          category: 'Technical Issue',
          user_name: 'Dr. Sarah Johnson',
          organization_name: 'Metropolitan Health Group',
          entity_name: 'City General Hospital',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          assigned_to: 'Support Team A'
        },
        {
          ticket_id: 'TK-002',
          title: 'Billing module calculation error',
          description: 'Invoice totals are not calculating correctly for multi-service appointments',
          priority: 'medium',
          status: 'in_progress',
          category: 'Bug Report',
          user_name: 'Michael Chen',
          organization_name: 'Children Health Network',
          entity_name: 'Pediatric Care Center',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          assigned_to: 'Dev Team'
        },
        {
          ticket_id: 'TK-003',
          title: 'Request for additional user licenses',
          description: 'Need to add 5 more veterinarian licenses to our subscription',
          priority: 'low',
          status: 'resolved',
          category: 'License Request',
          user_name: 'Emily Rodriguez',
          organization_name: 'PawMart Retail Group',
          entity_name: 'PawMart Online',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assigned_to: 'Sales Team'
        }
      ]

      setTickets(ticketData)

      // Calculate stats
      const openTickets = ticketData.filter(t => t.status === 'open' || t.status === 'in_progress')
      const resolvedToday = ticketData.filter(t => {
        const updated = new Date(t.updated_at)
        const today = new Date()
        return t.status === 'resolved' && 
               updated.toDateString() === today.toDateString()
      })

      setStats({
        totalTickets: ticketData.length,
        openTickets: openTickets.length,
        resolvedToday: resolvedToday.length,
        avgResponseTime: '2.4h'
      })

    } catch (error) {
      console.error('Error fetching support tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    }
    return variants[priority as keyof typeof variants] || variants.low
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[status as keyof typeof variants] || variants.open
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertCircle
      case 'in_progress': return Clock
      case 'resolved': return CheckCircle
      case 'closed': return CheckCircle
      default: return AlertCircle
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                  Support & Help Desk
                </h1>
                <p className="text-teal-600">Customer support ticket management</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-teal-700">{stats.totalTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.openTickets}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-700">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Support Tickets ({tickets.length})
              </span>
              <Button onClick={fetchTickets} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              All customer support requests and issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No support tickets found
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const StatusIcon = getStatusIcon(ticket.status)
                  return (
                    <div key={ticket.ticket_id} 
                         className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                            <p className="text-sm text-gray-500">#{ticket.ticket_id}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {ticket.user_name}
                          </span>
                          <span>{ticket.organization_name}</span>
                          <span>*</span>
                          <span>{ticket.entity_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Created: {formatDate(ticket.created_at)}</span>
                          <span>Updated: {formatDate(ticket.updated_at)}</span>
                          <span>Assigned: {ticket.assigned_to}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}