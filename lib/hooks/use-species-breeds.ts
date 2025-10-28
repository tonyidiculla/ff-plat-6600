import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Species {
  id: string
  name: string  // Common name (e.g., "Dog", "Cat")
  scientific_name: string
  category: string
  average_lifespan_min?: number
  average_lifespan_max?: number
  average_weight_min?: number
  average_weight_max?: number
  size_category?: string
  care_level?: string
  temperament_traits?: string[]
  common_health_issues?: string[]
  habitat_requirements?: string
  exercise_needs?: string
  grooming_requirements?: string
  description?: string
  origin_region?: string
  conservation_status?: string
  is_domestic?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Breed {
  id: string
  species_id: string
  name: string  // Breed name
  alternative_names?: string[]
  size_category?: string
  weight_range_min?: number
  weight_range_max?: number
  height_range_min?: number
  height_range_max?: number
  lifespan_min?: number
  lifespan_max?: number
  temperament_traits?: string[]
  energy_level?: string
  exercise_needs?: string
  grooming_requirements?: string
  shedding_level?: string
  training_difficulty?: string
  good_with_children?: boolean
  good_with_pets?: boolean
  apartment_friendly?: boolean
  coat_type?: string
  coat_colors?: string[]
  common_health_issues?: string[]
  special_care_requirements?: string
  origin_country?: string
  breed_group?: string
  recognition_status?: string
  description?: string
  breeding_considerations?: string
  diet_type?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpeciesWithStats extends Species {
  total_breeds: number
  registered_pets: number
}

export interface BreedWithSpecies extends Breed {
  species: {
    common_name: string
    scientific_name: string
  }
}

export function useSpeciesAndBreeds() {
  const [species, setSpecies] = useState<SpeciesWithStats[]>([])
  const [breeds, setBreeds] = useState<BreedWithSpecies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpecies = async () => {
    try {
      console.log('lion Fetching species from database...')

      // Fetch all species
      const { data: speciesData, error: speciesError } = await supabase
        .schema('public' as any)
        .from('species')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (speciesError) {
        console.error('[ERROR] Error fetching species:', speciesError)
        throw speciesError
      }

      console.log(`[OK] Fetched ${speciesData?.length || 0} species`)

      // For each species, get breed count and pet count
      const speciesWithStats = await Promise.all(
        (speciesData || []).map(async (sp) => {
          // Count breeds
          const { count: breedCount } = await supabase
            .schema('public' as any)
            .from('breeds')
            .select('id', { count: 'exact', head: true })
            .eq('species_id', sp.id)
            .eq('is_active', true)

          // Count pets
          const { count: petCount } = await supabase
            .schema('public' as any)
            .from('pets')
            .select('id', { count: 'exact', head: true })
            .eq('species', sp.name.toLowerCase())

          return {
            ...sp,
            total_breeds: breedCount || 0,
            registered_pets: petCount || 0
          }
        })
      )

      setSpecies(speciesWithStats)
    } catch (err: any) {
      console.error('Failed to fetch species:', err)
      setError(err.message)
    }
  }

  const fetchBreeds = async () => {
    try {
      console.log('dog Fetching breeds from database...')

      const { data: breedsData, error: breedsError } = await supabase
        .schema('public' as any)
        .from('breeds')
        .select(`
          *,
          species:species_id (
            name,
            scientific_name
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (breedsError) {
        console.error('[ERROR] Error fetching breeds:', breedsError)
        throw breedsError
      }

      console.log(`[OK] Fetched ${breedsData?.length || 0} breeds`)
      setBreeds(breedsData as any)
    } catch (err: any) {
      console.error('Failed to fetch breeds:', err)
      setError(err.message)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    await Promise.all([
      fetchSpecies(),
      fetchBreeds()
    ])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    species,
    breeds,
    loading,
    error,
    refetch: fetchData
  }
}
