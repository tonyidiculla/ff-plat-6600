'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Pet {
  id: string
  pet_platform_id: string
  user_id: string | null
  user_platform_id: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  color: string
  gender: string
  microchip_id: string | null
  date_of_birth: string
  is_active: boolean
  avatar: string | null
  created_at: string
  updated_at: string
  owner?: {
    first_name: string
    last_name: string
  }
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPets = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('paw Fetching pets from database...')
      
      // DEBUG: Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('[AUTH DEBUG] Current user:', {
        authenticated: !!user,
        userId: user?.id,
        email: user?.email,
        authError: authError
      })
      
      console.log('[search] Query details:', {
        schema: 'public',
        table: 'pets',
        operation: 'select all'
      })

      const { data, error: fetchError } = await supabase
        .schema('public' as any)
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Manually fetch owner names for each pet
      if (data && data.length > 0) {
        const uniqueOwnerIds = Array.from(new Set(data.map(pet => pet.user_platform_id)))
        const { data: owners } = await supabase
          .schema('public' as any)
          .from('profiles')
          .select('user_platform_id, first_name, last_name')
          .in('user_platform_id', uniqueOwnerIds)
        
        // Map owner data to pets
        const ownerMap = new Map(owners?.map(o => [o.user_platform_id, o]) || [])
        data.forEach(pet => {
          const owner = ownerMap.get(pet.user_platform_id)
          if (owner) {
            (pet as any).owner = { first_name: owner.first_name, last_name: owner.last_name }
          }
        })
      }

      console.log('[box] Query response:', { 
        hasData: !!data, 
        dataLength: data?.length, 
        hasError: !!fetchError,
        error: fetchError 
      })

      if (fetchError) {
        console.error('[ERROR] Error fetching pets:', fetchError)
        throw fetchError
      }

      console.log(`[OK] Fetched ${data?.length || 0} pets`, data)
      setPets(data || [])
    } catch (err) {
      console.error('Failed to fetch pets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pets')
      setPets([])
    } finally {
      setLoading(false)
    }
  }

  const updatePet = async (petId: string, updates: Partial<Pet>) => {
    try {
      console.log('[refresh] Updating pet:', petId, updates)

      // Check current authentication
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[lock] Current authenticated user:', user?.id)

      // Get the pet first to verify ownership
      const { data: pet, error: fetchError } = await supabase
        .schema('public' as any)
        .from('pets')
        .select('user_platform_id')
        .eq('id', petId)
        .single()

      if (fetchError) {
        console.error('[ERROR] Error fetching pet:', fetchError)
        throw fetchError
      }

      console.log('paw Pet user_platform_id:', pet?.user_platform_id)

      // Get user profile to verify
      const { data: profile, error: profileError } = await supabase
        .schema('public' as any)
        .from('profiles')
        .select('user_platform_id')
        .eq('user_id', user?.id)
        .single()

      if (profileError) {
        console.error('[ERROR] Error fetching profile:', profileError)
        throw profileError
      }

      console.log('[user] User user_platform_id:', profile?.user_platform_id)

      if (pet?.user_platform_id !== profile?.user_platform_id) {
        throw new Error('Permission denied: You do not own this pet')
      }

      const { data, error: updateError } = await supabase
        .schema('public' as any)
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select()
        .single()

      if (updateError) {
        console.error('[ERROR] Error updating pet:', updateError)
        console.error('Error MESSAGE:', updateError.message)
        console.error('Error CODE:', updateError.code)
        console.error('Error DETAILS:', updateError.details)
        console.error('Error HINT:', updateError.hint)
        console.error('Full error object:', JSON.stringify(updateError, null, 2))
        throw updateError
      }

      console.log('[OK] Pet updated successfully:', data)      // Update local state
      setPets(prevPets => 
        prevPets.map(pet => pet.id === petId ? { ...pet, ...data } : pet)
      )
      
      return data
    } catch (err) {
      console.error('Failed to update pet:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  return {
    pets,
    loading,
    error,
    refetch: fetchPets,
    updatePet
  }
}
