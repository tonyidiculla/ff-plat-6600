'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StandardizedHeaderWithSuspense } from '@/components/ui/standardized-header-with-suspense'
import { useToast } from '@/components/ui/use-toast'
import { useLocationCurrency } from '@/lib/hooks/useLocationCurrency'
import { supabase } from '@/lib/supabase/client'
import { Users, UserPlus, Shield, Mail, Phone, Eye, Edit, Trash2, Search, UserCheck, UserX, Power, PowerOff } from 'lucide-react'

interface User {
  // Core fields from database
  id: string
  user_id?: string
  user_platform_id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone?: string
  
  // Address fields (EXIST in DB)
  address?: string
  city?: string
  state?: string  // Database has 'state' not 'state_province'
  postal_code?: string
  country?: string
  
  // Personal info (EXIST in DB)
  date_of_birth?: string
  preferred_language?: string
  
  // Emergency contact (EXIST in DB)
  emergency_contact_name?: string
  emergency_contact_phone?: string
  
  // Consent fields (EXIST in DB)
  marketing_consent?: boolean
  marketing_consent_date?: string
  consent_verified?: boolean
  consent_verified_at?: string
  consent_method?: string
  
  // Billing & Notes (EXIST in DB)
  stripe_customer_id?: string
  notes?: string
  
  // Status fields (EXIST in DB)
  is_active: boolean
  is_approved?: boolean
  
  // Timestamps (EXIST in DB)
  created_at: string
  updated_at: string
  
  // Avatar/Icon storage (EXIST in DB)
  icon_storage?: {
    path: string
    bucket: string
    public_url: string
    uploaded_at: string
  }
  profile_image_url?: string
  avatar_url?: string
  
  // Role data (joined from other tables)
  role: string
  role_assignments?: UserRoleAssignment[]
  highest_privilege_level?: number
  role_names?: string[]
}

interface UserRoleAssignment {
  id: string
  user_platform_id: string
  platform_role_id: string
  is_active: boolean
  created_at: string
  expires_at?: string
  platform_role: PlatformRole
}

interface PlatformRole {
  id: string
  role_name: string
  display_name: string
  privilege_level: number
  is_active: boolean
}

// Phone number formatting utilities
const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it already starts with +, keep it as is
  if (phone.startsWith('+')) {
    return phone
  }
  
  // Remove any remaining non-digits for counting
  const digitsOnly = cleaned.replace(/\D/g, '')
  
  // Default to +1 (US/Canada) if exactly 10 digits
  if (digitsOnly.length === 10) {
    return `+1 ${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
  }
  
  // If it has 11 digits and starts with 1, format as US
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1 ${digitsOnly.slice(1, 4)}-${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`
  }
  
  // For other lengths, just add + if missing
  return digitsOnly.length >= 7 ? `+${digitsOnly}` : phone
}

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || !phone.trim()) return true // Optional field
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Must start with + for international format
  if (!cleaned.startsWith('+')) {
    // Allow raw digits only if 10-15 digits (will auto-add + later)
    const digitsOnly = cleaned.replace(/\D/g, '')
    return digitsOnly.length >= 7 && digitsOnly.length <= 15
  }
  
  // Remove the + and count digits
  const digitsOnly = cleaned.replace(/\D/g, '')
  
  // E.164 standard: 7-15 digits (including country code)
  // Examples:
  // - US/Canada: +1 (1 digit) + 10 digits = 11 total
  // - UK: +44 (2 digits) + 10 digits = 12 total
  // - India: +91 (2 digits) + 10 digits = 12 total
  // - China: +86 (2 digits) + 11 digits = 13 total
  // - Germany: +49 (2 digits) + 10-11 digits = 12-13 total
  
  return digitsOnly.length >= 7 && digitsOnly.length <= 15
}

const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // If already has +, return cleaned version
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // Remove all non-digits
  const digitsOnly = cleaned.replace(/\D/g, '')
  
  // Add default country code +1 for 10-digit numbers (US/Canada)
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }
  
  // Add + prefix for other valid lengths
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`
  }
  
  // Add + if missing
  return `+${cleaned}`
}

export default function UsersManagementPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsers: 0
  })

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_platform_id?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('[search] Fetching users from public.profiles...')

      // Use RPC function to get profiles with elevated privileges
      const { data: profiles, error: profilesError } = await (supabase as any)
        .rpc('get_platform_admin_profiles')

      console.log('[search] Profiles RPC result:', { profilesError, profilesLength: profiles?.length })
      
      // Fetch role assignments separately
      let roleAssignments: any[] = []
      let platformRoles: any[] = []
      
      if (!profilesError) {
        console.log('[OK] Profiles fetched, now fetching role assignments...')
        
        // Fetch role assignments with proper RLS policies
        const assignmentsResult = await (supabase as any)
          .schema('public')
          .from('user_to_role_assignment')
          .select('*')
        
        console.log('[chart] Assignments query result:', {
          error: assignmentsResult.error,
          count: assignmentsResult.data?.length,
          hasData: !!assignmentsResult.data
        })
        
        if (!assignmentsResult.error) {
          roleAssignments = assignmentsResult.data || []
          console.log(`[OK] Found ${roleAssignments.length} role assignments`)
          console.log('[clipboard] Sample assignments:', roleAssignments.slice(0, 3))
        } else {
          console.log('[warn] Could not fetch role assignments:', assignmentsResult.error.message)
          console.log('[warn] Full error:', assignmentsResult.error)
        }
        
        // Fetch platform roles
        const rolesResult = await (supabase as any)
          .schema('public')
          .from('platform_roles')
          .select('*')
        
        if (!rolesResult.error) {
          platformRoles = rolesResult.data || []
          console.log(`[OK] Found ${platformRoles.length} platform roles`)
          console.log('[clipboard] Sample roles:', platformRoles.slice(0, 3))
        } else {
          console.log('[warn] Could not fetch platform roles:', rolesResult.error.message)
        }
      }

      if (profilesError) {
        console.log('[ERROR] Profiles RPC query failed:', profilesError.message)
        setUsers([])
        setStats({ totalUsers: 0, activeUsers: 0, adminUsers: 0, newUsers: 0 })
        setLoading(false)
        return
      }

      if (profilesError) {
        console.error('[ERROR] Error fetching profiles:', profilesError)
        console.error('[ERROR] Error details:', {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint
        })
        throw profilesError
      }

      console.log(`[OK] Found ${profiles?.length || 0} total users in database`)
      console.log('[search] Raw profiles data sample:', profiles?.slice(0, 2))
      
      // Transform database records to match our User interface
      const transformedUsers: User[] = (profiles || []).map((profile: any) => {
        // Manually join role assignments for this profile
        const userAssignments = roleAssignments.filter((a: any) => 
          a.user_platform_id === profile.user_platform_id && a.is_active
        )
        
        // Debug: Log matching for first user
        if (profiles.indexOf(profile) === 0) {
          console.log('\n[search] DEBUG - First user matching:')
          console.log('Profile platform_id:', profile.user_platform_id)
          console.log('Profile platform_id type:', typeof profile.user_platform_id)
          console.log('Total role assignments in DB:', roleAssignments.length)
          console.log('Matching assignments:', userAssignments.length)
          if (roleAssignments.length > 0) {
            console.log('Sample assignment platform_id:', roleAssignments[0].user_platform_id)
            console.log('Sample assignment platform_id type:', typeof roleAssignments[0].user_platform_id)
          }
        }
        
        // Add the platform_role data to each assignment
        const enrichedAssignments = userAssignments.map((assignment: any) => ({
          ...assignment,
          platform_role: platformRoles.find((r: any) => r.id === assignment.platform_role_id)
        }))
        
        // Debug logging for the first few users to check data structure
        if (profiles.indexOf(profile) < 3) {
          console.log('[search] User profile data:', {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            user_platform_id: profile.user_platform_id,
            user_id: profile.user_id,
            icon_storage: profile.icon_storage,
            has_icon_url: !!profile.icon_storage?.public_url,
            role_assignments_count: enrichedAssignments.length,
            role_names: enrichedAssignments.map((a: any) => a.platform_role?.display_name || a.platform_role?.role_name),
            all_keys: Object.keys(profile)
          })
        }

        // Process role assignments
        const activeRoles = enrichedAssignments
        const roleNames = activeRoles.map((assignment: any) => assignment.platform_role?.display_name || assignment.platform_role?.role_name || 'Unknown Role')
        const highestPrivilegeLevel = Math.max(...activeRoles.map((assignment: any) => {
          const privilegeMap: { [key: string]: number } = {
            'platform_admin': 10,
            'entity_admin': 8,
            'department_manager': 7,
            'medical_practitioner': 6,
            'clinical_staff': 5,
            'technical_specialist': 4,
            'support_staff': 3,
            'external_access': 1
          }
          return privilegeMap[assignment.platform_role?.privilege_level] || 1
        }), 1)
        
        return {
          id: profile.id,
          user_id: profile.user_id || '', // Handle null user_id
          user_platform_id: profile.user_platform_id || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          // Address fields from database
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
          // Personal info from database
          date_of_birth: profile.date_of_birth || '',
          preferred_language: profile.preferred_language || '',
          // Emergency contact from database
          emergency_contact_name: profile.emergency_contact_name || '',
          emergency_contact_phone: profile.emergency_contact_phone || '',
          // Consent fields from database
          marketing_consent: profile.marketing_consent ?? false,
          marketing_consent_date: profile.marketing_consent_date || '',
          consent_verified: profile.consent_verified ?? false,
          consent_verified_at: profile.consent_verified_at || '',
          consent_method: profile.consent_method || '',
          // Billing & Notes from database
          stripe_customer_id: profile.stripe_customer_id || '',
          notes: profile.notes || '',
          // Status fields
          is_approved: profile.is_approved ?? false,
          // Avatar fields
          profile_image_url: profile.profile_image_url || '', // Legacy field
          icon_storage: profile.icon_storage || null, // Supabase storage object
          is_active: profile.is_active ?? true,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role_assignments: activeRoles, // Actual role assignments from database
          highest_privilege_level: highestPrivilegeLevel, // Calculated from actual roles
          role_names: roleNames.length > 0 ? roleNames : ['User'] // Actual role names or default to 'User'
        }
      })

      setUsers(transformedUsers)

      // Update stats based on real data
      setStats({
        totalUsers: profiles?.length || 0,
        activeUsers: transformedUsers.filter(u => u.is_active).length,
        adminUsers: transformedUsers.filter(u => (u.highest_privilege_level ?? 0) >= 8).length, // Admin and above
        newUsers: transformedUsers.filter(u => {
          const createdDate = new Date(u.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return createdDate > thirtyDaysAgo
        }).length
      })

      console.log(`[OK] Successfully loaded ${transformedUsers.length} users (showing first 100 of ${profiles?.length || 0} total)`)
      console.log('[search] First few users for debugging:', transformedUsers.slice(0, 3))
    } catch (error) {
      console.error('[ERROR] Error fetching users:', error)
      
      // Fallback to empty state on error
      setUsers([])
      setStats({ totalUsers: 0, activeUsers: 0, adminUsers: 0, newUsers: 0 })
    } finally {
      setLoading(false)
    }
  }

  // Action handlers
  const handleAddUser = () => {
    setIsAddUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleToggleUserStatus = async (user: User) => {
    setActionLoading(true)
    try {
      const newStatus = !user.is_active
      console.log(`[refresh] Toggling user status: ${user.first_name} ${user.last_name} to ${newStatus ? 'Active' : 'Inactive'}`)
      
      const supabaseClient = supabase as any
      const { error } = await supabaseClient
        .schema('public')
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_platform_id', user.user_platform_id)

      if (error) {
        console.error('[ERROR] Error toggling user status:', error)
        alert(`Failed to update user status: ${error.message}`)
      } else {
        console.log('[OK] User status updated successfully')
        // Update user in local state
        setUsers(users.map(u => 
          u.user_platform_id === user.user_platform_id 
            ? { ...u, is_active: newStatus }
            : u
        ))
        // Update stats
        setStats(prev => ({
          ...prev,
          activeUsers: newStatus 
            ? prev.activeUsers + 1 
            : prev.activeUsers - 1
        }))
      }
    } catch (error) {
      console.error('[ERROR] Error toggling user status:', error)
      alert('Failed to update user status. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      console.log(`[trash] Deleting user: ${selectedUser.first_name} ${selectedUser.last_name}`)
      
      const supabaseClient = supabase as any
      const { error } = await supabaseClient
        .schema('public')
        .from('profiles')
        .delete()
        .eq('user_platform_id', selectedUser.user_platform_id)

      if (error) {
        console.error('[ERROR] Error deleting user:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete user: ${error.message}`,
        })
      } else {
        console.log('[OK] User deleted successfully')
        toast({
          title: "Success!",
          description: `User ${selectedUser.first_name} ${selectedUser.last_name} has been deleted.`,
          duration: 3000,
        })
        // Remove user from local state
        setUsers(users.filter(u => u.user_platform_id !== selectedUser.user_platform_id))
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          activeUsers: selectedUser.is_active ? prev.activeUsers - 1 : prev.activeUsers
        }))
        // Auto-close modal after 1.5 seconds
        setTimeout(() => {
          setIsDeleteModalOpen(false)
          setSelectedUser(null)
        }, 1500)
        return // Exit early to prevent immediate close
      }
    } catch (error) {
      console.error('[ERROR] Error deleting user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to delete user. Please try again.',
      })
    } finally {
      setActionLoading(false)
      // Only close immediately if there was an error
      if (!selectedUser) {
        setIsDeleteModalOpen(false)
      }
    }
  }

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      console.log(`[note] Updating user: ${selectedUser.first_name} ${selectedUser.last_name}`)
      console.log('[clipboard] Update data received:', updatedData)
      console.log('[ID] Updating user with platform_id:', selectedUser.user_platform_id)
      
      // Validate phone number if provided
      if (updatedData.phone && !validatePhoneNumber(updatedData.phone)) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: 'Please use international format with country code (e.g., +1 555-123-4567)',
        })
        setActionLoading(false)
        return
      }
      
      // Normalize phone number before saving (or set to null if empty)
      const normalizedPhone = updatedData.phone?.trim() ? normalizePhoneNumber(updatedData.phone) : null
      
      console.log('[phone] Normalized phone:', normalizedPhone)
      
      const supabaseClient = supabase as any
      
      const updatePayload = {
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
        email: updatedData.email,
        phone: normalizedPhone,
        country: updatedData.country,
        preferred_language: updatedData.preferred_language,
        is_active: updatedData.is_active,
        // Address fields
        address: updatedData.address || null,
        city: updatedData.city || null,
        state: updatedData.state || null,
        postal_code: updatedData.postal_code || null,
        // Personal info
        date_of_birth: updatedData.date_of_birth || null,
        // Emergency contact
        emergency_contact_name: updatedData.emergency_contact_name || null,
        emergency_contact_phone: updatedData.emergency_contact_phone || null,
        // Consent fields (use ?? for booleans to preserve false values)
        marketing_consent: updatedData.marketing_consent ?? false,
        consent_verified: updatedData.consent_verified ?? false,
        // Billing & Notes
        stripe_customer_id: updatedData.stripe_customer_id || null,
        notes: updatedData.notes || null
      }
      
      console.log('[save] Sending update payload to database:', updatePayload)
      
      const { data, error } = await supabaseClient
        .schema('public')
        .from('profiles')
        .update(updatePayload)
        .eq('user_platform_id', selectedUser.user_platform_id)
        .select()

      console.log('[inbox] Database response:', { data, error })

      if (error) {
        console.error('[ERROR] Error updating user:', error)
        console.error('[ERROR] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update user: ${error.message}`,
        })
      } else {
        console.log('[OK] User updated successfully!')
        console.log('[OK] Updated data from database:', data)
        // Show success toast
        toast({
          title: "Success!",
          description: `${selectedUser.first_name} ${selectedUser.last_name} has been updated successfully.`,
          duration: 3000,
        })
        // Refresh the entire user list to get updated data
        await fetchUsers()
        // Auto-close modal after 1.5 seconds
        setTimeout(() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }, 1500)
      }
    } catch (error: any) {
      console.error('[ERROR] Error updating user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user: ${error?.message || 'Unknown error'}`,
      })
    } finally {
      console.log('[refresh] Resetting loading state')
      setActionLoading(false)
    }
  }

  const handleCreateUser = async (userData: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    country?: string
    preferred_language?: string
    is_active: boolean
  }) => {
    setActionLoading(true)
    try {
      console.log('[user] Creating new user:', userData)
      
      // Normalize phone number before saving
      const normalizedPhone = userData.phone ? normalizePhoneNumber(userData.phone) : null
      
      const supabaseClient = supabase as any
      const { data: newUser, error } = await supabaseClient
        .schema('public')
        .from('profiles')
        .insert([{
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: normalizedPhone,
          country: userData.country || 'United States',
          preferred_language: userData.preferred_language || 'en',
          is_active: userData.is_active,
          // These will be auto-generated by the database
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        console.error('[ERROR] Error creating user:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to create user: ${error.message}`,
        })
      } else {
        console.log('[OK] User created successfully:', newUser)
        toast({
          title: "Success!",
          description: `User ${userData.first_name} ${userData.last_name} has been created successfully.`,
          duration: 3000,
        })
        // Refresh the users list
        fetchUsers()
        // Auto-close modal after 1.5 seconds
        setTimeout(() => {
          setIsAddUserModalOpen(false)
        }, 1500)
      }
    } catch (error) {
      console.error('[ERROR] Error creating user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to create user. Please try again.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[status as keyof typeof variants] || variants.inactive
  }

  const getRoleBadge = (privilegeLevel: number) => {
    if (privilegeLevel <= 2) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (privilegeLevel <= 5) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Calculate difference in months
    const yearsDiff = now.getFullYear() - date.getFullYear()
    const monthsDiff = now.getMonth() - date.getMonth()
    const totalMonths = yearsDiff * 12 + monthsDiff
    
    // Calculate years and remaining months
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    
    // Build the result string
    if (years === 0 && months === 0) {
      return 'This month'
    } else if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} ago`
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} ago`
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} ago`
    }
  }

  const getAvatarInitials = (user: User) => {
    // Try different fallbacks for avatar initials
    console.log('[search] Getting avatar for user:', {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_platform_id: user.user_platform_id
    })
    
    if (user.first_name && user.first_name.trim()) {
      const initial = user.first_name.charAt(0).toUpperCase()
      console.log('[OK] Using first_name initial:', initial)
      return initial
    }
    if (user.last_name && user.last_name.trim()) {
      const initial = user.last_name.charAt(0).toUpperCase()
      console.log('[OK] Using last_name initial:', initial)
      return initial
    }
    if (user.email && user.email.trim()) {
      const initial = user.email.charAt(0).toUpperCase()
      console.log('[OK] Using email initial:', initial)
      return initial
    }
    if (user.user_platform_id && user.user_platform_id.trim()) {
      const initial = user.user_platform_id.charAt(0).toUpperCase()
      console.log('[OK] Using user_platform_id initial:', initial)
      return initial
    }
    console.log('[warn] Using fallback initial: U')
    return 'U' // Ultimate fallback
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <StandardizedHeaderWithSuspense />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <StandardizedHeaderWithSuspense />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-gray-600">Manage platform users and their roles</p>
              </div>
            </div>
            <Button 
              onClick={handleAddUser}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-rose-700">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-rose-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admin Users</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.adminUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.newUsers}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar - Positioned above users list */}
        <div className="mb-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, platform ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-colors bg-white"
                />
              </div>
              {searchTerm && (
                <div className="mt-3 text-sm text-gray-600">
                  Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users List - Table Format */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Platform Users ({stats.totalUsers} total)
              </span>
            </CardTitle>
            <CardDescription>
              Showing {filteredUsers.length} of {stats.totalUsers} user accounts across the platform
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Avatar</TableHead>
                    <TableHead className="w-[250px]">Name & ID</TableHead>
                    <TableHead className="w-[280px]">Contacts</TableHead>
                    <TableHead className="w-[180px]">Role</TableHead>
                    <TableHead className="w-[120px]">Joined</TableHead>
                    <TableHead className="w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_platform_id} className="hover:bg-gray-50">
                      <TableCell>
                        {/* Avatar with priority: icon_storage > profile_image_url > initials */}
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {/* First priority: icon_storage.public_url */}
                          {user.icon_storage?.public_url ? (
                            <img 
                              src={user.icon_storage.public_url} 
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide image and show initials on error
                                e.currentTarget.style.display = 'none'
                                const initialsSpan = e.currentTarget.parentElement?.querySelector('.initials-fallback') as HTMLElement
                                if (initialsSpan) {
                                  initialsSpan.style.display = 'flex'
                                }
                              }}
                            />
                          ) : user.profile_image_url ? (
                            <img 
                              src={user.profile_image_url} 
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide image and show initials on error
                                e.currentTarget.style.display = 'none'
                                const initialsSpan = e.currentTarget.parentElement?.querySelector('.initials-fallback') as HTMLElement
                                if (initialsSpan) {
                                  initialsSpan.style.display = 'flex'
                                }
                              }}
                            />
                          ) : null}
                          
                          {/* Initials fallback - only show if no image */}
                          <span 
                            className={`initials-fallback text-white font-bold text-xs items-center justify-center w-full h-full ${
                              (user.icon_storage?.public_url || user.profile_image_url) ? 'hidden' : 'flex'
                            }`}
                          >
                            {getAvatarInitials(user)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[250px]">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </div>
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs inline-block">
                            {user.user_platform_id}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="w-[280px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm truncate max-w-[230px]" title={user.email}>
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-mono">{formatPhoneNumber(user.phone)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="space-y-1">
                          {user.role_names && user.role_names.map((role, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={`${getRoleBadge(user.highest_privilege_level || 1)} text-xs`}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            className={`${user.is_active 
                              ? 'hover:bg-orange-50 hover:text-orange-600 text-orange-600' 
                              : 'hover:bg-green-50 hover:text-green-600 text-green-600'
                            }`}
                            disabled={actionLoading}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.is_active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add User Modal */}
        <AddUserModal 
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSave={handleCreateUser}
          loading={actionLoading}
        />

        {/* Edit User Modal */}
        <EditUserModal 
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onSave={handleUpdateUser}
          loading={actionLoading}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
                This action cannot be undone and will permanently remove their account and all associated data.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedUser(null)
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteUser}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}: {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<User>) => void
  loading: boolean
}) {
  const { countries, languages, loading: locationLoading } = useLocationCurrency()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'United States',
    preferred_language: 'en',
    is_active: true,
    // Address fields
    address: '',
    city: '',
    state: '',
    postal_code: '',
    // Personal info
    date_of_birth: '',
    // Emergency contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Consent fields
    marketing_consent: false,
    consent_verified: false,
    // Billing & Notes
    stripe_customer_id: '',
    notes: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || 'United States',
        preferred_language: user.preferred_language || 'en',
        is_active: user.is_active,
        // Address fields
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        // Personal info
        date_of_birth: user.date_of_birth || '',
        // Emergency contact
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        // Consent fields (use ?? for booleans to preserve false values)
        marketing_consent: user.marketing_consent ?? false,
        consent_verified: user.consent_verified ?? false,
        // Billing & Notes
        stripe_customer_id: user.stripe_customer_id || '',
        notes: user.notes || ''
      })
      // Reset avatar state and set preview if exists
      setAvatarFile(null)
      if (user.icon_storage?.public_url) {
        setAvatarPreview(user.icon_storage.public_url)
      } else if (user.profile_image_url) {
        setAvatarPreview(user.profile_image_url)
      } else if (user.avatar_url) {
        setAvatarPreview(user.avatar_url)
      } else {
        setAvatarPreview('')
      }
    } else {
      // Reset everything when modal closes (user becomes null)
      setAvatarPreview('')
      setAvatarFile(null)
    }
  }, [user?.id, isOpen])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update information for {user?.first_name} {user?.last_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email Address *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone Number</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  onBlur={(e) => {
                    // Auto-format on blur if valid
                    const phone = e.target.value.trim()
                    if (phone && validatePhoneNumber(phone)) {
                      setFormData({...formData, phone: formatPhoneNumber(phone)})
                    }
                  }}
                  placeholder="+1 555-123-4567"
                  className={formData.phone && !validatePhoneNumber(formData.phone) ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Format: +[country code] [number] (e.g., +1 555-123-4567)</p>
                {formData.phone && !validatePhoneNumber(formData.phone) && (
                  <p className="text-xs text-red-500 mt-1">Please include country code (e.g., +1 for US/Canada)</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit_country">Country</Label>
                <select
                  id="edit_country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={locationLoading}
                >
                  <option value="">Select a country...</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.country_name}>
                      {country.country_name} ({country.country_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Avatar</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="edit_avatar">Upload New Avatar</Label>
                <Input
                  id="edit_avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 200x200px. Max size: 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit_address">Street Address</Label>
                <Input
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="edit_state">State/Province</Label>
                <Input
                  id="edit_state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="NY"
                />
              </div>
              <div>
                <Label htmlFor="edit_postal_code">Postal Code</Label>
                <Input
                  id="edit_postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_emergency_name">Contact Name</Label>
                <Input
                  id="edit_emergency_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="edit_emergency_phone">Contact Phone</Label>
                <Input
                  id="edit_emergency_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  placeholder="+1 555-123-4567"
                />
              </div>
            </div>
          </div>

          {/* Consent & Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Consent & Preferences</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="edit_marketing_consent"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({...formData, marketing_consent: e.target.checked})}
                    className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor="edit_marketing_consent" className="cursor-pointer font-medium">
                      Marketing Consent
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      By checking this box and providing your number, you consent to receive marketing text messages from FURFIELD at this number, including messages sent by autodialer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_consent_verified"
                  checked={formData.consent_verified}
                  onChange={(e) => setFormData({...formData, consent_verified: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="edit_consent_verified" className="cursor-pointer">
                  Consent Verified
                </Label>
              </div>
            </div>
          </div>

          {/* Billing & Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Billing & Notes</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit_stripe_customer_id">Stripe Customer ID</Label>
                <Input
                  id="edit_stripe_customer_id"
                  value={formData.stripe_customer_id}
                  onChange={(e) => setFormData({...formData, stripe_customer_id: e.target.value})}
                  placeholder="cus_..."
                />
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any additional notes about this user..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Optional Fields (Read-Only - If They Exist in DB) */}
          {(user?.address || user?.city || user?.state || user?.postal_code || user?.date_of_birth || 
            user?.emergency_contact_name || user?.emergency_contact_phone ||
            user?.marketing_consent !== undefined || user?.consent_verified !== undefined || 
            user?.stripe_customer_id || user?.notes) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Additional Information 
                <span className="text-xs font-normal text-gray-500 ml-2">(Read-only - from database)</span>
              </h3>
              
              {/* Address Information */}
              {(user?.address || user?.city || user?.state || user?.postal_code) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">[pin] Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {user?.address && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Street:</span>
                        <span className="ml-2">{user.address}</span>
                      </div>
                    )}
                    {user?.city && (
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <span className="ml-2">{user.city}</span>
                      </div>
                    )}
                    {user?.state && (
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <span className="ml-2">{user.state}</span>
                      </div>
                    )}
                    {user?.postal_code && (
                      <div>
                        <span className="font-medium text-gray-700">Postal Code:</span>
                        <span className="ml-2">{user.postal_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              {user?.date_of_birth && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">[user] Personal</h4>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Date of Birth:</span>
                    <span className="ml-2">{new Date(user.date_of_birth).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(user?.emergency_contact_name || user?.emergency_contact_phone) && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">[alert] Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {user?.emergency_contact_name && (
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2">{user.emergency_contact_name}</span>
                      </div>
                    )}
                    {user?.emergency_contact_phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2">{user.emergency_contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consent & Billing */}
              {(user?.marketing_consent !== undefined || user?.consent_verified !== undefined || user?.stripe_customer_id) && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">[OK] Consent & Billing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {user?.marketing_consent !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Marketing Consent:</span>
                        <span>{user.marketing_consent ? '[OK] Yes' : '[ERROR] No'}</span>
                      </div>
                    )}
                    {user?.consent_verified !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Consent Verified:</span>
                        <span>{user.consent_verified ? '[OK] Yes' : '[ERROR] No'}</span>
                      </div>
                    )}
                    {user?.stripe_customer_id && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Stripe Customer ID:</span>
                        <span className="font-mono ml-2 text-xs">{user.stripe_customer_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {user?.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">[note] Notes</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{user.notes}</p>
                </div>
              )}

              <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                [info] These fields are fetched from the database. If they appear, they exist in your schema.
                To enable editing, ensure the migration has been run.
              </p>
            </div>
          )}

          {/* Account Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Settings</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="edit_is_active" className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_active ? 'User is currently Active' : 'User is currently Inactive'}
                </p>
              </div>
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add User Modal Component
function AddUserModal({ 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    country?: string
    preferred_language?: string
    is_active: boolean
  }) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'United States',
    preferred_language: 'en',
    is_active: true
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: 'United States',
        preferred_language: 'en',
        is_active: true
      })
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with complete information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add_first_name">First Name *</Label>
                <Input
                  id="add_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_last_name">Last Name *</Label>
                <Input
                  id="add_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_email">Email Address *</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_phone">Phone Number</Label>
                <Input
                  id="add_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  onBlur={(e) => {
                    // Auto-format on blur if valid
                    const phone = e.target.value.trim()
                    if (phone && validatePhoneNumber(phone)) {
                      setFormData({...formData, phone: formatPhoneNumber(phone)})
                    }
                  }}
                  placeholder="+1 555-123-4567"
                  className={formData.phone && !validatePhoneNumber(formData.phone) ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Format: +[country code] [number] (e.g., +1 555-123-4567)</p>
                {formData.phone && !validatePhoneNumber(formData.phone) && (
                  <p className="text-xs text-red-500 mt-1">Please include country code (e.g., +1 for US/Canada)</p>
                )}
              </div>
              <div>
                <Label htmlFor="add_country">Country</Label>
                <Input
                  id="add_country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label htmlFor="add_preferred_language">Preferred Language</Label>
                <select
                  id="add_preferred_language"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ar">Arabic</option>
                  <option value="pt">Portuguese</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Settings</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="add_is_active" className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_active ? 'User will be created as Active' : 'User will be created as Inactive'}
                </p>
              </div>
              <Switch
                id="add_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}