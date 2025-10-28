// Profile interface for existing public.profiles table
export interface Profile {
  id: number
  user_id: string
  user_platform_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  date_of_birth: string | null
  preferred_language: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
  stripe_customer_id: string | null
  is_active: boolean | null
  is_approved: boolean | null
  consent_verified: boolean | null
  consent_verified_at: string | null
  consent_method: string | null
  marketing_consent: boolean | null
  marketing_consent_date: string | null
  created_at: string
  updated_at: string
  icon_storage: string | null
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  preferred_language?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}