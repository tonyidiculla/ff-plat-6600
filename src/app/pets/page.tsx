'use client'

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { StandardizedHeaderWithSuspense } from "@/components/ui/standardized-header-with-suspense"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, PawPrint, Search, Filter, Plus, FileText, Calendar, TrendingUp, User, Edit2, ClipboardList, Dna, Activity, Syringe, Stethoscope, ListTree, Loader2, Power, PowerOff, Eye, ChevronDown, ChevronRight, ChevronsDown, ChevronsUp } from "lucide-react"
import { useState } from "react"
import { usePets } from "@/lib/hooks/use-pets"
import { useSpeciesAndBreeds } from "@/lib/hooks/use-species-breeds"
import { useEMRRecords } from "@/lib/hooks/use-emr-records"
import { supabase } from "@/lib/supabase/client"

// Mock data - Replace with actual Supabase data
const mockPets = [
  {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 5,
    weight: 32,
    color: 'Golden',
    owner: { first_name: 'John', last_name: 'Smith' },
    organization: 'Happy Paws Hospital',
    status: 'active',
    last_visit: '2025-10-05',
    medical_records: 12,
    vaccinations_due: false
  },
  {
    id: '2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Persian',
    age: 3,
    weight: 4.5,
    color: 'White',
    owner: { first_name: 'Sarah', last_name: 'Johnson' },
    organization: 'City Vet Clinic',
    status: 'active',
    last_visit: '2025-09-28',
    medical_records: 8,
    vaccinations_due: true
  },
  {
    id: '3',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Labrador',
    age: 2,
    weight: 28,
    color: 'Black',
    owner: { first_name: 'Michael', last_name: 'Brown' },
    organization: 'Pet Care Solutions',
    status: 'active',
    last_visit: '2025-10-08',
    medical_records: 5,
    vaccinations_due: false
  },
  {
    id: '4',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 4,
    weight: 3.8,
    color: 'Seal Point',
    owner: { first_name: 'Emily', last_name: 'Davis' },
    organization: 'Happy Paws Hospital',
    status: 'inactive',
    last_visit: '2025-08-15',
    medical_records: 15,
    vaccinations_due: true
  }
]

const mockMedicalRecords = [
  {
    id: '1',
    pet_id: '1',
    pet_name: 'Max',
    species: 'Dog',
    visit_date: '2025-10-05',
    visit_type: 'Routine Checkup',
    diagnosis: 'Healthy',
    treatment: 'Annual vaccination booster',
    veterinarian: 'Dr. Sarah Williams',
    organization: 'Happy Paws Hospital',
    status: 'completed'
  },
  {
    id: '2',
    pet_id: '2',
    pet_name: 'Whiskers',
    species: 'Cat',
    visit_date: '2025-09-28',
    visit_type: 'Follow-up',
    diagnosis: 'Upper Respiratory Infection',
    treatment: 'Antibiotics prescribed',
    veterinarian: 'Dr. Michael Chen',
    organization: 'City Vet Clinic',
    status: 'in-progress'
  },
  {
    id: '3',
    pet_id: '3',
    pet_name: 'Buddy',
    species: 'Dog',
    visit_date: '2025-10-08',
    visit_type: 'Emergency',
    diagnosis: 'Minor laceration',
    treatment: 'Wound cleaning and bandaging',
    veterinarian: 'Dr. Jennifer Park',
    organization: 'Pet Care Solutions',
    status: 'completed'
  },
  {
    id: '4',
    pet_id: '1',
    pet_name: 'Max',
    species: 'Dog',
    visit_date: '2025-09-15',
    visit_type: 'Surgery',
    diagnosis: 'Dental cleaning',
    treatment: 'Professional dental cleaning with extractions',
    veterinarian: 'Dr. Sarah Williams',
    organization: 'Happy Paws Hospital',
    status: 'completed'
  },
]

const mockSpecies = [
  {
    id: '1',
    name: 'Dog',
    scientific_name: 'Canis familiaris',
    total_breeds: 15,
    registered_pets: 2500,
    icon: 'dog'
  },
  {
    id: '2',
    name: 'Cat',
    scientific_name: 'Felis catus',
    total_breeds: 12,
    registered_pets: 1800,
    icon: 'cat'
  },
  {
    id: '3',
    name: 'Bird',
    scientific_name: 'Various',
    total_breeds: 8,
    registered_pets: 450,
    icon: 'parrot'
  },
  {
    id: '4',
    name: 'Rabbit',
    scientific_name: 'Oryctolagus cuniculus',
    total_breeds: 6,
    registered_pets: 320,
    icon: 'rabbit'
  }
]

const mockBreeds = [
  { id: '1', species: 'Dog', name: 'Golden Retriever', registered_count: 450 },
  { id: '2', species: 'Dog', name: 'Labrador', registered_count: 520 },
  { id: '3', species: 'Dog', name: 'German Shepherd', registered_count: 380 },
  { id: '4', species: 'Dog', name: 'Beagle', registered_count: 290 },
  { id: '5', species: 'Cat', name: 'Persian', registered_count: 350 },
  { id: '6', species: 'Cat', name: 'Siamese', registered_count: 420 },
  { id: '7', species: 'Cat', name: 'Maine Coon', registered_count: 310 },
  { id: '8', species: 'Cat', name: 'British Shorthair', registered_count: 280 },
]

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreatePetModalOpen, setIsCreatePetModalOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Collapsible tree state - track which species are expanded
  const [expandedSpecies, setExpandedSpecies] = useState<Set<string>>(new Set())
  
  // Species & Breed modal states
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false)
  const [isBreedModalOpen, setIsBreedModalOpen] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null)
  const [selectedBreed, setSelectedBreed] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Fetch real pets data from database
  const { pets: dbPets, loading, error, updatePet } = usePets()
  
  // Fetch species and breeds data
  const { species: dbSpecies, breeds: dbBreeds, loading: speciesLoading } = useSpeciesAndBreeds()
  
  // Fetch EMR records data
  const { records: emrRecords, loading: emrLoading, error: emrError } = useEMRRecords()

  // Get total EMR records count from database (for admin stats)
  // This includes ALL EMR-related records across all tables
  const [totalEMRCount, setTotalEMRCount] = React.useState<number>(0)
  
  React.useEffect(() => {
    const fetchTotalEMRCount = async () => {
      try {
        // Count records from all EMR tables in parallel
        const [masterResult, iotResult] = await Promise.all([
          supabase
            .schema('public' as any)
            .from('emr_records_master')
            .select('*', { count: 'exact', head: true }),
          supabase
            .schema('public' as any)
            .from('emr_records_iot')
            .select('*', { count: 'exact', head: true })
        ])
        
        const masterCount = (!masterResult.error && masterResult.count !== null) ? masterResult.count : 0
        const iotCount = (!iotResult.error && iotResult.count !== null) ? iotResult.count : 0
        const totalCount = masterCount + iotCount
        
        console.log('[stats] EMR record counts:', {
          master: masterCount,
          iot: iotCount,
          total: totalCount
        })
        
        setTotalEMRCount(totalCount)
      } catch (err) {
        console.error('[ERROR] Failed to fetch EMR counts:', err)
      }
    }
    
    fetchTotalEMRCount()
  }, [])

  // Toggle species expansion
  const toggleSpecies = (speciesId: string) => {
    setExpandedSpecies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(speciesId)) {
        newSet.delete(speciesId)
      } else {
        newSet.add(speciesId)
      }
      return newSet
    })
  }

  // Expand all species
  const expandAll = () => {
    setExpandedSpecies(new Set(dbSpecies.map(s => s.id)))
  }

  // Collapse all species
  const collapseAll = () => {
    setExpandedSpecies(new Set())
  }

  // Handler for pet actions
  const handleEdit = (pet: any) => {
    setSelectedPet(pet)
    setIsEditModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsEditModalOpen(false)
    setSelectedPet(null)
    setAvatarPreview(null)
  }

  // Create Pet handlers
  const handleCreatePet = () => {
    setIsCreatePetModalOpen(true)
  }

  const handleCloseCreatePetModal = () => {
    setIsCreatePetModalOpen(false)
    setAvatarPreview(null)
  }

  const handleSaveNewPet = async (formData: FormData) => {
    setIsSaving(true)
    try {
      // Get user_platform_id from current user's profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .schema('public' as any)
        .from('profiles')
        .select('user_platform_id')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Calculate age from date of birth
      const dateOfBirth = formData.get('date_of_birth') as string
      const birth = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      const newPetData = {
        name: formData.get('name') as string,
        species: formData.get('species') as string,
        breed: formData.get('breed') as string,
        gender: formData.get('gender') as string,
        weight: parseFloat(formData.get('weight') as string),
        age: age,
        color: formData.get('color') as string,
        date_of_birth: dateOfBirth,
        microchip_id: formData.get('microchip_id') as string || null,
        avatar: avatarPreview || null,
        user_platform_id: profile.user_platform_id,
        is_active: true
      }

      const { error } = await supabase
        .schema('public' as any)
        .from('pets')
        .insert([newPetData])

      if (error) throw error

      console.log('[OK] Pet created successfully')
      handleCloseCreatePetModal()
      // Refresh the page to show new pet
      window.location.reload()
    } catch (err: any) {
      console.error('[ERROR] Failed to create pet:', err)
      alert(`Failed to create pet: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Species handlers
  const handleCreateSpecies = () => {
    setSelectedSpecies(null)
    setIsSpeciesModalOpen(true)
  }

  const handleEditSpecies = (species: any) => {
    setSelectedSpecies(species)
    setIsSpeciesModalOpen(true)
  }

  const handleCloseSpeciesModal = () => {
    setIsSpeciesModalOpen(false)
    setSelectedSpecies(null)
  }

  const handleSaveSpecies = async (formData: FormData) => {
    setIsSaving(true)
    try {
      const speciesData = {
        name: formData.get('name') as string,
        scientific_name: formData.get('scientific_name') as string,
        category: formData.get('category') as string,
        average_lifespan_min: parseInt(formData.get('average_lifespan_min') as string) || null,
        average_lifespan_max: parseInt(formData.get('average_lifespan_max') as string) || null,
        size_category: formData.get('size_category') as string || null,
        is_domestic: formData.get('is_domestic') === 'true',
        description: formData.get('description') as string || null,
        is_active: true
      }

      if (selectedSpecies) {
        // Update existing species
        const { error } = await supabase
          .schema('public' as any)
          .from('species')
          .update(speciesData)
          .eq('id', selectedSpecies.id)
        
        if (error) throw error
        console.log('[OK] Species updated successfully')
      } else {
        // Create new species
        const { error } = await supabase
          .schema('public' as any)
          .from('species')
          .insert([speciesData])
        
        if (error) throw error
        console.log('[OK] Species created successfully')
      }

      handleCloseSpeciesModal()
      // Refresh the page to show new data
      window.location.reload()
    } catch (err: any) {
      console.error('[ERROR] Failed to save species:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Breed handlers
  const handleCreateBreed = () => {
    setSelectedBreed(null)
    setIsBreedModalOpen(true)
  }

  const handleEditBreed = (breed: any) => {
    setSelectedBreed(breed)
    setIsBreedModalOpen(true)
  }

  const handleCloseBreedModal = () => {
    setIsBreedModalOpen(false)
    setSelectedBreed(null)
  }

  const handleSaveBreed = async (formData: FormData) => {
    setIsSaving(true)
    try {
      const breedData = {
        species_id: formData.get('species_id') as string,
        name: formData.get('name') as string,
        origin_country: formData.get('origin_country') as string || null,
        size_category: formData.get('size_category') as string || null,
        energy_level: formData.get('energy_level') as string || null,
        temperament_traits: formData.get('temperament_traits') 
          ? (formData.get('temperament_traits') as string).split(',').map(t => t.trim()) 
          : [],
        good_with_children: formData.get('good_with_children') === 'true',
        good_with_pets: formData.get('good_with_pets') === 'true',
        description: formData.get('description') as string || null,
        is_active: true
      }

      if (selectedBreed) {
        // Update existing breed
        const { error } = await supabase
          .schema('public' as any)
          .from('breeds')
          .update(breedData)
          .eq('id', selectedBreed.id)
        
        if (error) throw error
        console.log('[OK] Breed updated successfully')
      } else {
        // Create new breed
        const { error } = await supabase
          .schema('public' as any)
          .from('breeds')
          .insert([breedData])
        
        if (error) throw error
        console.log('[OK] Breed created successfully')
      }

      handleCloseBreedModal()
      // Refresh the page to show new data
      window.location.reload()
    } catch (err: any) {
      console.error('[ERROR] Failed to save breed:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (pet: any) => {
    try {
      await updatePet(pet.id, { is_active: !pet.is_active })
      console.log(`[OK] Pet ${pet.is_active ? 'deactivated' : 'activated'} successfully`)
    } catch (err) {
      console.error('[ERROR] Failed to toggle pet status:', err)
      // TODO: Show error toast notification
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedPet.pet_platform_id}-${Date.now()}.${fileExt}`
      const filePath = `pets/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update selected pet with new avatar
      setSelectedPet({ ...selectedPet, avatar: publicUrl })
      console.log('[OK] Avatar uploaded successfully')
    } catch (err: any) {
      console.error('[ERROR] Failed to upload avatar:', err)
      alert(`Failed to upload avatar: ${err.message}`)
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Calculate age from date_of_birth
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Transform database pets to match UI structure
  const pets = dbPets.map(pet => ({
    ...pet,
    age: calculateAge(pet.date_of_birth),
    status: pet.is_active ? 'active' : 'inactive',
    last_visit: pet.updated_at,
    medical_records: 0 // TODO: Get from EMR tables
  }))

  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.user_platform_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecies = speciesFilter === "all" || pet.species.toLowerCase() === speciesFilter.toLowerCase()
    
    return matchesSearch && matchesSpecies
  })

  const totalPets = pets.length
  const activePets = pets.filter(p => p.is_active).length
  const totalRecords = emrRecords.length
  
  // Calculate asset counts by category
  const totalNotesAssets = emrRecords.reduce((sum, record) => sum + (record.asset_counts?.notes || 0), 0)
  const totalLaboratoryAssets = emrRecords.reduce((sum, record) => sum + (record.asset_counts?.laboratory || 0), 0)
  const totalImagingAssets = emrRecords.reduce((sum, record) => sum + (record.asset_counts?.imaging || 0), 0)
  const totalVitalsAssets = emrRecords.reduce((sum, record) => sum + (record.asset_counts?.vitals || 0), 0)
  const totalIoTAssets = emrRecords.reduce((sum, record) => sum + (record.asset_counts?.iot || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpeciesIcon = (species: string) => {
    return species.toLowerCase() === 'dog' ? 'dog' : species.toLowerCase() === 'cat' ? 'cat' : 'paw'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 flex items-center justify-center">
        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Make sure RLS policies are set up correctly. See the documentation for setup instructions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100/60 to-red-100/40 dark:from-blue-900 dark:via-slate-900/60 dark:to-red-900/40">
      <StandardizedHeaderWithSuspense />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-700 to-rose-700 bg-clip-text text-transparent">
              Pet Management
            </h1>
            <p className="text-gray-600">Pet registry, medical records management, and species/breed catalog</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* Primary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Pets</CardTitle>
                <PawPrint className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{totalPets.toLocaleString()}</div>
                <p className="text-xs text-green-600">Registered in platform</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Active Pets</CardTitle>
                <Heart className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{activePets.toLocaleString()}</div>
                <p className="text-xs text-emerald-600">Currently active</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-green-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{totalEMRCount.toLocaleString()}</div>
                <p className="text-xs text-blue-600">Total EMR records</p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Categories Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-0 bg-purple-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Notes</CardTitle>
                <FileText className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{totalNotesAssets.toLocaleString()}</div>
                <p className="text-xs text-purple-600">Total note assets</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-blue-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Laboratory</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{totalLaboratoryAssets.toLocaleString()}</div>
                <p className="text-xs text-blue-600">Lab test assets</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-cyan-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-700">Imaging</CardTitle>
                <Eye className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-700">{totalImagingAssets.toLocaleString()}</div>
                <p className="text-xs text-cyan-600">Imaging assets</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-rose-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-700">Vitals</CardTitle>
                <Stethoscope className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-700">{totalVitalsAssets.toLocaleString()}</div>
                <p className="text-xs text-rose-600">Vital sign assets</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-amber-50/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">IoT</CardTitle>
                <Activity className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{totalIoTAssets.toLocaleString()}</div>
                <p className="text-xs text-amber-600">IoT device records</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="registry" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="registry" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              Pet Registry
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="species" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              Species & Breeds
            </TabsTrigger>
          </TabsList>

          {/* Pet Registry Tab */}
          <TabsContent value="registry" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle>Pet Registry</CardTitle>
                    <CardDescription>Search and manage all registered pets across organizations</CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
                    onClick={handleCreatePet}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Pet
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search pets, owners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <select
                      value={speciesFilter}
                      onChange={(e) => setSpeciesFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Species</option>
                      {dbSpecies.map(species => (
                        <option key={species.id} value={species.name.toLowerCase()}>
                          {species.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium text-sm">Pet</th>
                        <th className="text-left p-3 font-medium text-sm">Pet ID</th>
                        <th className="text-left p-3 font-medium text-sm">Owner Name</th>
                        <th className="text-left p-3 font-medium text-sm">Owner ID</th>
                        <th className="text-left p-3 font-medium text-sm">Breed</th>
                        <th className="text-left p-3 font-medium text-sm">Color</th>
                        <th className="text-left p-3 font-medium text-sm">Age</th>
                        <th className="text-right p-3 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPets.map((pet) => (
                        <tr 
                          key={pet.id} 
                          className="border-b hover:bg-accent/50 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              {pet.avatar ? (
                                <img 
                                  src={pet.avatar} 
                                  alt={pet.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center border-2 border-gray-200">
                                  <span className="text-xl">{getSpeciesIcon(pet.species)}</span>
                                </div>
                              )}
                              <span className="font-medium">{pet.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {pet.pet_platform_id}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {pet.owner ? `${pet.owner.first_name} ${pet.owner.last_name}` : 'N/A'}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {pet.user_platform_id}
                          </td>
                          <td className="p-3 text-sm">{pet.breed}</td>
                          <td className="p-3 text-sm">{pet.color}</td>
                          <td className="p-3 text-sm">{pet.age} years</td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleActive(pet)}
                                className={`${pet.is_active 
                                  ? 'hover:bg-orange-50 hover:text-orange-600 text-orange-600' 
                                  : 'hover:bg-green-50 hover:text-green-600 text-green-600'
                                }`}
                                title={pet.is_active ? 'Deactivate Pet' : 'Activate Pet'}
                              >
                                {pet.is_active ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(pet)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPets.length === 0 && (
                    <div className="text-center py-12">
                      <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || speciesFilter !== "all" 
                          ? 'No pets found matching your filters' 
                          : 'No pets registered yet'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="medical" className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>Electronic medical records and visit history</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emrLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-cyan-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading medical records...</p>
                  </div>
                ) : emrError ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">Error loading medical records</p>
                    <p className="text-sm text-muted-foreground">{emrError}</p>
                  </div>
                ) : emrRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No medical records found</p>
                  </div>
                ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium text-sm">Pet</th>
                        <th className="text-left p-3 font-medium text-sm">Owner</th>
                        <th className="text-center p-3 font-medium text-sm">Notes</th>
                        <th className="text-center p-3 font-medium text-sm">Laboratory</th>
                        <th className="text-center p-3 font-medium text-sm">Imaging</th>
                        <th className="text-center p-3 font-medium text-sm">Vitals</th>
                        <th className="text-center p-3 font-medium text-sm">IoT</th>
                        <th className="text-center p-3 font-medium text-sm">Total Assets</th>
                        <th className="text-right p-3 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emrRecords.map((record) => (
                        <tr 
                          key={record.id} 
                          className="border-b hover:bg-accent/50 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              {record.pet?.avatar ? (
                                <img 
                                  src={record.pet.avatar} 
                                  alt={record.pet.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-gray-200">
                                  <Stethoscope className="h-5 w-5 text-cyan-600" />
                                </div>
                              )}
                              <div>
                                <span className="font-medium">{record.pet?.name || 'Unknown'}</span>
                                <p className="text-xs text-muted-foreground">
                                  {record.pet?.pet_platform_id || record.pet_platform_id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {record.owner ? `${record.owner.first_name} ${record.owner.last_name}` : '--'}
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">
                              {record.asset_counts?.notes || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">
                              {record.asset_counts?.laboratory || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">
                              {record.asset_counts?.imaging || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">
                              {record.asset_counts?.vitals || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-muted-foreground">
                              {record.asset_counts?.iot || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-sm font-semibold">
                              {record.asset_counts?.total || 0}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Species & Breeds Tab */}
          <TabsContent value="species" className="space-y-6">
            {/* Species & Breeds Catalog - Table Tree View */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Species & Breeds Catalog</CardTitle>
                    <CardDescription>Manage animal species and breeds in a hierarchical view</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={expandAll}
                      className="text-xs"
                    >
                      <ChevronsDown className="h-3 w-3 mr-1" />
                      Expand All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={collapseAll}
                      className="text-xs"
                    >
                      <ChevronsUp className="h-3 w-3 mr-1" />
                      Collapse All
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      onClick={handleCreateSpecies}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Species
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      onClick={handleCreateBreed}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Breed
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {speciesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <span className="ml-2 text-muted-foreground">Loading breeds...</span>
                  </div>
                ) : dbBreeds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No breeds found. Add breeds to your species catalog.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Species / Breed</th>
                          <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Origin</th>
                          <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Size</th>
                          <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Temperament</th>
                          <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Energy Level</th>
                          <th className="text-center px-4 py-3 font-semibold text-sm text-gray-700">Status</th>
                          <th className="text-center px-4 py-3 font-semibold text-sm text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbSpecies.map((species) => {
                          const speciesBreeds = dbBreeds.filter(
                            (breed) => breed.species_id === species.id
                          )

                          const getSpeciesIcon = (name: string) => {
                            const iconMap: { [key: string]: string } = {
                              'dog': 'dog',
                              'cat': 'cat',
                              'bird': 'parrot',
                              'rabbit': 'rabbit',
                              'hamster': 'hamster',
                              'guinea pig': 'hamster',
                              'reptile': 'lizard',
                              'fish': 'fish',
                              'equine': 'horse',
                              'horse': 'horse'
                            }
                            const key = name.toLowerCase()
                            return iconMap[key] || 'paw'
                          }

                          const isExpanded = expandedSpecies.has(species.id)

                          return (
                            <React.Fragment key={species.id}>
                              {/* Species Header Row - Clickable */}
                              <tr 
                                className="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 border-t-2 border-purple-200 cursor-pointer hover:from-purple-200/50 hover:to-indigo-200/50 transition-colors"
                                onClick={() => toggleSpecies(species.id)}
                              >
                                <td colSpan={7} className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <button className="flex items-center justify-center w-6 h-6 rounded hover:bg-purple-200/50 transition-colors">
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-purple-700" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-purple-700" />
                                      )}
                                    </button>
                                    <span className="text-2xl">{getSpeciesIcon(species.name)}</span>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-lg text-purple-900">{species.name}</h3>
                                      <span className="text-sm text-gray-600 italic">({species.scientific_name})</span>
                                      <Badge variant="secondary" className="ml-2">
                                        {speciesBreeds.length} {speciesBreeds.length === 1 ? 'breed' : 'breeds'}
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* Breed Rows - Only show when expanded */}
                              {isExpanded && speciesBreeds.length === 0 && (
                                <tr className="border-b-2 border-purple-100">
                                  <td colSpan={7} className="px-4 py-3">
                                    <div className="flex items-center gap-2 pl-8 text-gray-500 italic">
                                      <span className="text-purple-400">|--</span>
                                      <span>No breeds yet. Click "Create Breed" to add one.</span>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              
                              {isExpanded && speciesBreeds.map((breed, idx) => (
                                <tr 
                                  key={breed.id} 
                                  className={`hover:bg-purple-50/30 transition-colors ${
                                    idx === speciesBreeds.length - 1 ? 'border-b-2 border-purple-100' : 'border-b border-gray-100'
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 pl-8">
                                      <span className="text-purple-400">|--</span>
                                      <span className="font-medium text-gray-800">{breed.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {breed.origin_country || '--'}
                                  </td>
                                  <td className="px-4 py-3">
                                    {breed.size_category ? (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {breed.size_category}
                                      </Badge>
                                    ) : '--'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {breed.temperament_traits && breed.temperament_traits.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {breed.temperament_traits.slice(0, 2).map((trait, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs capitalize">
                                            {trait}
                                          </Badge>
                                        ))}
                                        {breed.temperament_traits.length > 2 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{breed.temperament_traits.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : '--'}
                                  </td>
                                  <td className="px-4 py-3">
                                    {breed.energy_level ? (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs capitalize ${
                                          breed.energy_level === 'high' ? 'border-orange-300 text-orange-700' :
                                          breed.energy_level === 'medium' ? 'border-blue-300 text-blue-700' :
                                          'border-green-300 text-green-700'
                                        }`}
                                      >
                                        {breed.energy_level}
                                      </Badge>
                                    ) : '--'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge variant={breed.is_active ? "default" : "secondary"} className="text-xs">
                                      {breed.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEditBreed(breed)
                                        }}
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEditBreed(breed)
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Pet Modal */}
      {isEditModalOpen && selectedPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModals}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Pet</h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModals}>x</Button>
            </div>
            
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              // Calculate age from date of birth
              const dateOfBirth = formData.get('date_of_birth') as string
              const birth = new Date(dateOfBirth)
              const today = new Date()
              let age = today.getFullYear() - birth.getFullYear()
              const monthDiff = today.getMonth() - birth.getMonth()
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--
              }
              
              const updates = {
                name: formData.get('name') as string,
                species: formData.get('species') as string,
                breed: formData.get('breed') as string,
                gender: formData.get('gender') as string,
                weight: parseFloat(formData.get('weight') as string),
                age: age, // Auto-calculated from date_of_birth
                color: formData.get('color') as string,
                date_of_birth: dateOfBirth,
                microchip_id: formData.get('microchip_id') as string || null,
                avatar: selectedPet.avatar, // Use avatar from state (uploaded file)
                is_active: selectedPet.is_active
              }
              try {
                await updatePet(selectedPet.id, updates)
                console.log('[OK] Pet updated successfully')
                handleCloseModals()
              } catch (err: any) {
                console.error('[ERROR] Failed to update pet:', err)
                alert(`Failed to save: ${err.message}`)
              }
            }}>
              {/* Avatar Section */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="flex-shrink-0">
                  <label htmlFor="avatar-upload" className="cursor-pointer block">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all relative group">
                      {(avatarPreview || selectedPet.avatar) ? (
                        <img 
                          src={avatarPreview || selectedPet.avatar} 
                          alt={selectedPet.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-4xl">{getSpeciesIcon(selectedPet.species)}</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {uploadingAvatar ? 'Uploading...' : 'Change'}
                        </span>
                      </div>
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">Click to upload</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-sm font-medium">Pet Name</label>
                    <Input name="name" defaultValue={selectedPet.name} required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pet Platform ID</label>
                    <Input 
                      name="pet_platform_id" 
                      value={selectedPet.pet_platform_id} 
                      readOnly 
                      disabled
                      className="mt-1 bg-gray-100 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Owner Information</h3>
                <div>
                  <label className="text-sm font-medium">Owner Name</label>
                  <Input 
                    value={selectedPet.owner ? `${selectedPet.owner.first_name} ${selectedPet.owner.last_name}` : 'Unknown'} 
                    disabled 
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Owner Platform ID</label>
                  <Input 
                    value={selectedPet.user_platform_id} 
                    readOnly 
                    disabled 
                    className="mt-1 bg-gray-100 cursor-not-allowed" 
                  />
                </div>
              </div>

              {/* Pet Details Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Pet Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Species</label>
                    <select 
                      name="species" 
                      defaultValue={selectedPet.species} 
                      required 
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Species</option>
                      {dbSpecies.map(species => (
                        <option key={species.id} value={species.name.toLowerCase()}>
                          {species.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Breed</label>
                    <Input name="breed" defaultValue={selectedPet.breed} required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gender</label>
                    <select 
                      name="gender" 
                      defaultValue={selectedPet.gender} 
                      required 
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input name="date_of_birth" type="date" defaultValue={selectedPet.date_of_birth} required className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Age is auto-calculated: {selectedPet.age} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight (kg)</label>
                    <Input name="weight" type="number" step="0.1" defaultValue={selectedPet.weight} required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Input name="color" defaultValue={selectedPet.color} required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Microchip ID</label>
                    <Input name="microchip_id" defaultValue={selectedPet.microchip_id || ''} placeholder="Optional" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2 pt-2 border-t">
                <h3 className="font-semibold text-lg">Status</h3>
                <div className="flex items-center space-x-3">
                  <Switch 
                    checked={selectedPet.is_active}
                    onCheckedChange={(checked) => {
                      setSelectedPet({ ...selectedPet, is_active: checked })
                    }}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm font-medium">
                    {selectedPet.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className={`ml-2 p-1.5 rounded-full ${
                    selectedPet.is_active 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Power className={`h-4 w-4 ${selectedPet.is_active ? 'fill-current' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>Created: {new Date(selectedPet.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(selectedPet.updated_at).toLocaleString()}</p>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseModals}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Species Modal */}
      <Dialog open={isSpeciesModalOpen} onOpenChange={setIsSpeciesModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSpecies ? 'Edit Species' : 'Create New Species'}</DialogTitle>
            <DialogDescription>
              {selectedSpecies ? 'Update the species information below.' : 'Add a new species to the catalog.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSaveSpecies(new FormData(e.currentTarget))
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Common Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedSpecies?.name}
                  placeholder="e.g., Dog, Cat, Bird"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scientific_name">Scientific Name *</Label>
                <Input 
                  id="scientific_name" 
                  name="scientific_name" 
                  defaultValue={selectedSpecies?.scientific_name}
                  placeholder="e.g., Canis lupus familiaris"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={selectedSpecies?.category || 'mammal'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mammal">Mammal</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="reptile">Reptile</SelectItem>
                    <SelectItem value="amphibian">Amphibian</SelectItem>
                    <SelectItem value="fish">Fish</SelectItem>
                    <SelectItem value="invertebrate">Invertebrate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size_category">Size Category</Label>
                <Select name="size_category" defaultValue={selectedSpecies?.size_category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiny">Tiny</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="giant">Giant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="average_lifespan_min">Lifespan Min (years)</Label>
                <Input 
                  id="average_lifespan_min" 
                  name="average_lifespan_min" 
                  type="number"
                  defaultValue={selectedSpecies?.average_lifespan_min}
                  placeholder="e.g., 10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="average_lifespan_max">Lifespan Max (years)</Label>
                <Input 
                  id="average_lifespan_max" 
                  name="average_lifespan_max" 
                  type="number"
                  defaultValue={selectedSpecies?.average_lifespan_max}
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_domestic">Domestic Species</Label>
              <Select name="is_domestic" defaultValue={selectedSpecies?.is_domestic?.toString() || 'true'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes - Domestic</SelectItem>
                  <SelectItem value="false">No - Wild</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={selectedSpecies?.description}
                placeholder="Enter species description..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseSpeciesModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedSpecies ? 'Update Species' : 'Create Species'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Breed Modal */}
      <Dialog open={isBreedModalOpen} onOpenChange={setIsBreedModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBreed ? 'Edit Breed' : 'Create New Breed'}</DialogTitle>
            <DialogDescription>
              {selectedBreed ? 'Update the breed information below.' : 'Add a new breed to the catalog.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSaveBreed(new FormData(e.currentTarget))
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species_id">Species *</Label>
                <Select name="species_id" defaultValue={selectedBreed?.species_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbSpecies.map((species) => (
                      <SelectItem key={species.id} value={species.id}>
                        {species.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Breed Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedBreed?.name}
                  placeholder="e.g., Golden Retriever"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin_country">Origin Country</Label>
                <Input 
                  id="origin_country" 
                  name="origin_country" 
                  defaultValue={selectedBreed?.origin_country}
                  placeholder="e.g., Scotland"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size_category">Size Category</Label>
                <Select name="size_category" defaultValue={selectedBreed?.size_category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toy">Toy</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="giant">Giant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="energy_level">Energy Level</Label>
                <Select name="energy_level" defaultValue={selectedBreed?.energy_level || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select energy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperament_traits">Temperament (comma-separated)</Label>
                <Input 
                  id="temperament_traits" 
                  name="temperament_traits" 
                  defaultValue={selectedBreed?.temperament_traits?.join(', ')}
                  placeholder="e.g., friendly, intelligent, loyal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="good_with_children">Good with Children</Label>
                <Select name="good_with_children" defaultValue={selectedBreed?.good_with_children?.toString() || 'true'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="good_with_pets">Good with Other Pets</Label>
                <Select name="good_with_pets" defaultValue={selectedBreed?.good_with_pets?.toString() || 'true'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={selectedBreed?.description}
                placeholder="Enter breed description..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseBreedModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedBreed ? 'Update Breed' : 'Create Breed'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Pet Modal */}
      <Dialog open={isCreatePetModalOpen} onOpenChange={setIsCreatePetModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
            <DialogDescription>
              Register a new pet in the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSaveNewPet(new FormData(e.currentTarget))
          }} className="space-y-4">
            {/* Pet Details Section */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Pet Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pet_name">Pet Name *</Label>
                  <Input 
                    id="pet_name" 
                    name="name" 
                    placeholder="e.g., Max, Bella"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pet_gender">Gender *</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet_species">Species *</Label>
                <select 
                  id="pet_species" 
                  name="species" 
                  required 
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Select Species</option>
                  {dbSpecies.map(species => (
                    <option key={species.id} value={species.name.toLowerCase()}>
                      {species.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pet_breed">Breed *</Label>
                <Input 
                  id="pet_breed" 
                  name="breed" 
                  placeholder="e.g., Golden Retriever"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet_color">Color *</Label>
                <Input 
                  id="pet_color" 
                  name="color" 
                  placeholder="e.g., Golden, Black"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pet_weight">Weight (kg) *</Label>
                <Input 
                  id="pet_weight" 
                  name="weight" 
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet_dob">Date of Birth *</Label>
                <Input 
                  id="pet_dob" 
                  name="date_of_birth" 
                  type="date"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pet_microchip">Microchip ID</Label>
                <Input 
                  id="pet_microchip" 
                  name="microchip_id" 
                  placeholder="Optional"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreatePetModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Pet'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
