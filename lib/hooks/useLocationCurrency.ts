'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface LocationCurrency {
  id: string
  country_code: string
  country_name: string
  currency_code: string
  currency_name: string
  currency_symbol: string
  language_code: string
  language_name: string
  is_active: boolean
}

export function useLocationCurrency() {
  const [countries, setCountries] = useState<LocationCurrency[]>([])
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocationData()
  }, [])

  const fetchLocationData = async () => {
    try {
      setLoading(true)
      const supabaseClient = supabase as any
      
      const { data, error: fetchError } = await supabaseClient
        .schema('public')
        .from('location_currency')
        .select('*')
        .eq('is_active', true)
        .order('country_name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setCountries(data || [])
      
      // Extract unique languages
      const uniqueLanguages = Array.from(
        new Map(
          data?.map((item: LocationCurrency) => [
            item.language_code,
            { code: item.language_code, name: item.language_name }
          ])
        ).values()
      ) as { code: string; name: string }[]
      setLanguages(uniqueLanguages)

      setError(null)
    } catch (err: any) {
      console.error('Error fetching location data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCountryByCode = (code: string) => {
    return countries.find(c => c.country_code === code)
  }

  const getLanguageForCountry = (countryCode: string) => {
    const country = countries.find(c => c.country_code === countryCode)
    return country?.language_code || 'en'
  }

  const getCurrencyForCountry = (countryCode: string) => {
    const country = countries.find(c => c.country_code === countryCode)
    return country?.currency_code || 'USD'
  }

  return {
    countries,
    languages,
    loading,
    error,
    getCountryByCode,
    getLanguageForCountry,
    getCurrencyForCountry,
    refresh: fetchLocationData
  }
}
