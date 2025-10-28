'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandardizedHeaderWithSuspense } from "@/components/ui/standardized-header-with-suspense"
import { 
  ClipboardList, Heart, Stethoscope, Calendar, User, FileText, 
  Activity, TestTube, Pill, Syringe, Search, Filter, Plus,
  Eye, Download, TrendingUp, AlertCircle, CheckCircle
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

// Mock patient data - Replace with actual Supabase data
const mockPatients = [
  {
    id: '1',
    pet: {
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 5,
      weight: 32,
      color: 'Golden',
      owner: { first_name: 'John', last_name: 'Smith', phone: '+1-555-0123' }
    },
    organization: 'Happy Paws Hospital',
    is_active: true,
    consent_verified: true,
    onboarded_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z',
    last_visit: '2025-10-05',
    total_visits: 12,
    recent_diagnosis: 'Routine checkup - healthy',
    upcoming_appointments: 1,
    vaccinations_status: 'Up to date',
    medical_alerts: []
  },
  {
    id: '2',
    pet: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 3,
      weight: 4.5,
      color: 'White',
      owner: { first_name: 'Sarah', last_name: 'Johnson', phone: '+1-555-0456' }
    },
    organization: 'City Vet Clinic',
    is_active: true,
    consent_verified: true,
    onboarded_at: '2024-03-20T14:15:00Z',
    created_at: '2024-03-20T14:15:00Z',
    last_visit: '2025-09-28',
    total_visits: 8,
    recent_diagnosis: 'Dental cleaning required',
    upcoming_appointments: 2,
    vaccinations_status: 'Rabies due next month',
    medical_alerts: ['Allergic to certain antibiotics']
  },
  {
    id: '3',
    pet: {
      name: 'Buddy',
      species: 'Dog',
      breed: 'Labrador',
      age: 2,
      weight: 28,
      color: 'Black',
      owner: { first_name: 'Michael', last_name: 'Brown', phone: '+1-555-0789' }
    },
    organization: 'Pet Care Solutions',
    is_active: true,
    consent_verified: false,
    onboarded_at: '2024-06-10T09:00:00Z',
    created_at: '2024-06-10T09:00:00Z',
    last_visit: '2025-10-08',
    total_visits: 5,
    recent_diagnosis: 'Minor skin irritation - treated',
    upcoming_appointments: 0,
    vaccinations_status: 'Up to date',
    medical_alerts: []
  }
]

export default function PetEMRPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter(patient =>
    patient.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.pet?.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.pet?.owner?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.pet?.owner?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPatients = mockPatients.length
  const activePatients = mockPatients.filter(p => p.is_active).length
  const totalVisits = mockPatients.reduce((sum, p) => sum + p.total_visits, 0)
  const todayOnboards = mockPatients.filter(p => 
    new Date(p.created_at).toDateString() === new Date().toDateString()
  ).length

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 dark:from-blue-900 dark:via-slate-900/60 dark:to-red-900/40">
      <StandardizedHeaderWithSuspense />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                Pet Electronic Medical Records
              </h1>
              <p className="text-gray-600">Comprehensive medical documentation and patient care tracking</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Patient Record
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Patients</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{totalPatients}</div>
              <p className="text-xs text-blue-600">Onboarded patients</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active Patients</CardTitle>
              <Stethoscope className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{activePatients}</div>
              <p className="text-xs text-green-600">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Visits</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{totalVisits}</div>
              <p className="text-xs text-purple-600">Medical consultations</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Today's Onboards</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{todayOnboards}</div>
              <p className="text-xs text-orange-600">New today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Patient Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Recent Patient Activity</CardTitle>
                <CardDescription>Latest patient onboarding and medical activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPatients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{patient.pet?.name}</h4>
                          <Badge variant="outline">{patient.pet?.species}</Badge>
                          <Badge className={patient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {patient.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {patient.consent_verified && (
                            <Badge className="bg-blue-100 text-blue-800">Consent [OK]</Badge>
                          )}
                          {patient.medical_alerts.length > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Alert
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Owner</p>
                            <p className="font-medium">
                              {patient.pet?.owner?.first_name} {patient.pet?.owner?.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Organization</p>
                            <p className="font-medium">{patient.organization}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Visits</p>
                            <p className="font-medium">{patient.total_visits} visits</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Visit</p>
                            <p className="font-medium">{new Date(patient.last_visit).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {patient.recent_diagnosis && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Recent:</strong> {patient.recent_diagnosis}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View EMR
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Onboarded Patients</CardTitle>
                    <CardDescription>Search and manage patient medical records</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by patient name, species, or owner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{patient.pet?.name}</h3>
                            <Badge variant="outline">{patient.pet?.species}</Badge>
                            <Badge className={patient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {patient.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {patient.consent_verified ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Consent Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Consent Pending
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Species</p>
                              <p className="font-medium">{patient.pet?.species}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Breed</p>
                              <p className="font-medium">{patient.pet?.breed}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Owner</p>
                              <p className="font-medium">
                                {patient.pet?.owner?.first_name} {patient.pet?.owner?.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Organization</p>
                              <p className="font-medium">{patient.organization}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Vaccinations</p>
                              <p className="font-medium text-xs">{patient.vaccinations_status}</p>
                            </div>
                          </div>
                          {patient.pet?.age && (
                            <div className="mt-3 text-sm">
                              <p className="text-muted-foreground">Additional Info</p>
                              <p>
                                Age: {patient.pet.age} years
                                {patient.pet?.weight && ` * Weight: ${patient.pet.weight} kg`}
                                {patient.pet?.color && ` * Color: ${patient.pet.color}`}
                              </p>
                            </div>
                          )}
                          {patient.medical_alerts.length > 0 && (
                            <div className="mt-3">
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Medical Alert: {patient.medical_alerts.join(', ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/pets?petId=${patient.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View EMR
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No patients found matching your search' : 'No patients onboarded yet'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Visit Trends</CardTitle>
                  <CardDescription>Patient visit analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Visits This Month</span>
                      <span className="text-2xl font-bold text-blue-700">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Visits per Patient</span>
                      <span className="text-xl font-semibold text-green-700">4.2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Species Distribution</CardTitle>
                  <CardDescription>Patient demographics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dogs</span>
                      <Badge>67%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cats</span>
                      <Badge>33%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
