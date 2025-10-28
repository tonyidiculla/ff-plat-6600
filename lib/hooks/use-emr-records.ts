'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface EMRRecord {
  id: string
  emr_platform_id: string
  emr_asset_code: string | null
  pet_platform_id: string
  entity_platform_id: string
  user_platform_id: string
  visit_type: string
  chief_complaint: string | null
  diagnosis: string | null
  treatment_plan: string | null
  prescriptions: any | null
  notes: string | null
  veterinarian_name: string | null
  veterinarian_id: string | null
  status: string
  is_active: boolean
  follow_up_date: string | null
  created_at: string
  updated_at: string
  // Joined data
  pet?: {
    name: string
    species: string
    breed: string
    avatar: string | null
    pet_platform_id?: string
  }
  owner?: {
    first_name: string
    last_name: string
  }
  asset_counts?: {
    total: number
    notes: number
    laboratory: number
    imaging: number
    vitals: number
    iot: number
  }
}

export function useEMRRecords() {
  const [records, setRecords] = useState<EMRRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[hospital] Fetching EMR records from database...')
      console.log('[search] Query details:', {
        schema: 'public',
        table: 'emr_records_master',
        operation: 'select all'
      })

      const { data, error: fetchError } = await supabase
        .schema('public' as any)
        .from('emr_records_master')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fetch related pet data
      if (data && data.length > 0) {
        const uniquePetIds = Array.from(new Set(data.map(record => record.pet_platform_id)))
        const { data: pets } = await supabase
          .schema('public' as any)
          .from('pets')
          .select('pet_platform_id, name, species, breed, avatar, user_platform_id')
          .in('pet_platform_id', uniquePetIds)
        
        // Fetch owner data
        const uniqueOwnerIds = Array.from(new Set(pets?.map(pet => pet.user_platform_id) || []))
        const { data: owners } = await supabase
          .schema('public' as any)
          .from('profiles')
          .select('user_platform_id, first_name, last_name')
          .in('user_platform_id', uniqueOwnerIds)
        
        // Fetch IoT records count for each EMR record
        // Using pet_platform_id to link IoT records to EMR records
        const petIdsForIoT = Array.from(new Set(data.map(record => record.pet_platform_id)))
        console.log('[search] Fetching IoT records for Pet IDs:', petIdsForIoT)
        
        const { data: iotRecords, error: iotError } = await supabase
          .schema('public' as any)
          .from('emr_records_iot')
          .select('pet_platform_id')
          .in('pet_platform_id', petIdsForIoT)
        
        console.log('[chart] IoT records fetched:', { 
          count: iotRecords?.length || 0, 
          hasError: !!iotError,
          error: iotError,
          records: iotRecords 
        })
        
        // Count IoT records per pet (will be aggregated per EMR record)
        const iotCountsMap = new Map<string, number>()
        iotRecords?.forEach(iot => {
          iotCountsMap.set(iot.pet_platform_id, (iotCountsMap.get(iot.pet_platform_id) || 0) + 1)
        })
        
        console.log('[up] IoT counts map by pet:', Array.from(iotCountsMap.entries()))
        
        // Calculate asset counts by categorizing based on emr_asset_code prefix
        const assetCountsMap = new Map<string, { total: number; notes: number; laboratory: number; imaging: number; vitals: number; iot: number }>()
        
        data.forEach(record => {
          const counts = { total: 0, notes: 0, laboratory: 0, imaging: 0, vitals: 0, iot: 0 }
          
          if (record.emr_asset_code) {
            counts.total = 1
            
            const assetCode = record.emr_asset_code.toUpperCase()
            if (assetCode.startsWith('IMG_')) {
              counts.imaging = 1
            } else if (assetCode.startsWith('NOT_')) {
              counts.notes = 1
            } else if (assetCode.startsWith('VIT_')) {
              counts.vitals = 1
            } else if (assetCode.startsWith('LAB_')) {
              counts.laboratory = 1
            }
          }
          
          // Add IoT count (using pet_platform_id to link IoT records)
          counts.iot = iotCountsMap.get(record.pet_platform_id) || 0
          if (counts.iot > 0) {
            counts.total += counts.iot
          }
          
          assetCountsMap.set(record.id, counts)
        })
        
        // Map pet and owner data to records
        const petMap = new Map(pets?.map(p => [p.pet_platform_id, p]) || [])
        const ownerMap = new Map(owners?.map(o => [o.user_platform_id, o]) || [])
        
        data.forEach(record => {
          const pet = petMap.get(record.pet_platform_id)
          if (pet) {
            (record as any).pet = { 
              name: pet.name, 
              species: pet.species, 
              breed: pet.breed,
              avatar: pet.avatar,
              pet_platform_id: pet.pet_platform_id
            }
            const owner = ownerMap.get(pet.user_platform_id)
            if (owner) {
              (record as any).owner = { first_name: owner.first_name, last_name: owner.last_name }
            }
          }
          
          // Add asset counts (using record.id to match the key in assetCountsMap)
          const assetCounts = assetCountsMap.get(record.id) || { total: 0, notes: 0, laboratory: 0, imaging: 0, vitals: 0, iot: 0 }
          ;(record as any).asset_counts = assetCounts
        })
      }

      console.log('[box] Query response:', { 
        hasData: !!data, 
        dataLength: data?.length, 
        hasError: !!fetchError,
        error: fetchError 
      })

      if (fetchError) {
        console.error('[ERROR] Error fetching EMR records:', fetchError)
        throw fetchError
      }

      console.log('[OK] Fetched EMR records:', data?.length || 0, 'records')
      setRecords((data as EMRRecord[]) || [])
    } catch (err: any) {
      console.error('[ERROR] Failed to fetch EMR records:', err)
      setError(err.message || 'Failed to fetch EMR records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const refreshRecords = () => {
    fetchRecords()
  }

  return {
    records,
    loading,
    error,
    refreshRecords
  }
}
