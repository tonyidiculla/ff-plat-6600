export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      global_location_currency_master_l01: {
        Row: {
          country_code: string | null
          country_name: string | null
          created_at: string | null
          currency_code: string | null
          currency_name: string | null
          currency_symbol: string | null
          id: string | null
          is_active: boolean | null
          language_code: string | null
          language_name: string | null
          market_markup: number | null
          ppp_multiplier: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          id?: string | null
          is_active?: boolean | null
          language_code?: string | null
          language_name?: string | null
          market_markup?: number | null
          ppp_multiplier?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          id?: string | null
          is_active?: boolean | null
          language_code?: string | null
          language_name?: string | null
          market_markup?: number | null
          ppp_multiplier?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      append_to_soap_note: {
        Args: {
          author_name: string
          new_content: string
          note_id: string
          section_name: string
        }
        Returns: boolean
      }
      assign_role_to_hospital: {
        Args:
          | {
              _hospital_id: string
              _hospital_type: string
              _is_active?: boolean
              _role_value: string
            }
          | { _hospital_id: string; _is_active?: boolean; _role_value: string }
        Returns: boolean
      }
      assign_role_to_user: {
        Args: {
          p_assigned_by?: string
          p_expires_at?: string
          p_hospital_id?: string
          p_notes?: string
          p_organization_id?: string
          p_role_value: string
          p_user_id: string
        }
        Returns: string
      }
      assign_user_role: {
        Args: {
          p_entity_id?: string
          p_system_role_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      bulk_assign_roles_to_hospital: {
        Args:
          | {
              _hospital_id: string
              _hospital_type: string
              _role_values: string[]
            }
          | { _hospital_id: string; _role_values: string[] }
        Returns: boolean
      }
      can_access_entity: {
        Args: { entity_id: string; entity_type: string }
        Returns: boolean
      }
      can_access_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
      can_manage_roles: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_privilege_level: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      confirm_test_user: {
        Args: { user_email: string }
        Returns: undefined
      }
      create_channel_partner_l02: {
        Args: {
          admin_user_id: string
          billing_cycle: string
          country: string
          currency: string
          entity_id: string
          entity_platform_id: string
          language: string
          modules: string[]
          next_billing_date: string
          organization_id: string
          trial_end_date: string
        }
        Returns: string
      }
      create_cp_territory: {
        Args:
          | {
              p_assigned_partner_id?: string
              p_cities?: string[]
              p_country: string
              p_coverage_type: string
              p_description?: string
              p_market_potential?: number
              p_population?: number
              p_states?: string[]
              p_status?: string
              p_territory_code: string
              p_territory_name: string
            }
          | {
              p_assigned_partner_id?: string
              p_cities?: string[]
              p_country: string
              p_coverage_type?: string
              p_description?: string
              p_established_date?: string
              p_market_potential?: number
              p_notes?: string
              p_population?: number
              p_postal_codes?: string[]
              p_states_provinces?: string[]
              p_status?: string
              p_territory_code: string
              p_territory_manager_id?: string
              p_territory_name: string
            }
        Returns: string
      }
      create_basic_entity: {
        Args: {
          p_accent_color?: string
          p_accreditations?: Json
          p_address?: string
          p_capacity?: number
          p_city?: string
          p_country?: string
          p_currency?: string
          p_description?: string
          p_email?: string
          p_emergency_contact_number?: string
          p_entity_id: string
          p_entity_name: string
          p_entity_platform_id: string
          p_entity_type: string
          p_language?: string
          p_licenses?: Json
          p_logo_storage?: Json
          p_manager_email?: string
          p_manager_name?: string
          p_module_names?: string[]
          p_operating_hours?: string
          p_organization_id: string
          p_phone?: string
          p_postal_code?: string
          p_primary_color?: string
          p_secondary_color?: string
          p_service_area?: string
          p_social_media?: Json
          p_specialties?: string
          p_state?: string
          p_vat_gst_number?: string
          p_website?: string
        }
        Returns: Json
      }
      create_hospital_entity: {
        Args: {
          p_accent_color?: string
          p_accreditations?: Json
          p_address?: string
          p_boarding_daycare?: boolean
          p_capacity?: number
          p_cardiology_diagnostics?: boolean
          p_chemotherapy_cancer?: boolean
          p_chief_veterinarian_contact?: string
          p_chief_veterinarian_name?: string
          p_city?: string
          p_client_education?: boolean
          p_country?: string
          p_currency?: string
          p_dental_care?: boolean
          p_dermatology_dept?: boolean
          p_description?: string
          p_diagnostic_imaging?: boolean
          p_email?: string
          p_emergency_contact_number?: string
          p_emergency_critical_care?: boolean
          p_emergency_surgery?: boolean
          p_entity_id: string
          p_entity_name: string
          p_entity_platform_id: string
          p_entity_type: string
          p_exotic_medicine?: boolean
          p_general_consultations?: boolean
          p_grief_counseling?: boolean
          p_grooming_services?: boolean
          p_hospitalization_monitoring?: boolean
          p_isolation_wards?: boolean
          p_laboratory_testing?: boolean
          p_language?: string
          p_licenses?: Json
          p_logo_storage?: Json
          p_manager_email?: string
          p_manager_name?: string
          p_microchipping?: boolean
          p_minimally_invasive?: boolean
          p_module_names?: string[]
          p_neurology_dept?: boolean
          p_nursing_care?: boolean
          p_nutritional_counseling?: boolean
          p_oncology_dept?: boolean
          p_operating_hours?: string
          p_ophthalmology_dept?: boolean
          p_organization_id: string
          p_orthopedic_surgery?: boolean
          p_pain_management?: boolean
          p_pharmacy_services?: boolean
          p_phone?: string
          p_postal_code?: string
          p_practice_type?: string
          p_preventive_care?: boolean
          p_primary_color?: string
          p_rehabilitation_physio?: boolean
          p_secondary_color?: string
          p_service_area?: string
          p_social_media?: Json
          p_soft_tissue_surgery?: boolean
          p_specialized_treatments?: boolean
          p_specialties?: string
          p_state?: string
          p_surgical_suites?: number
          p_treatment_rooms?: number
          p_vat_gst_number?: string
          p_waste_management_protocol?: string
          p_website?: string
          p_wellness_geriatric?: boolean
        }
        Returns: Json
      }
      create_estore_l02: {
        Args: {
          admin_user_id: string
          billing_cycle: string
          country: string
          currency: string
          entity_id: string
          entity_platform_id: string
          language: string
          modules: string[]
          next_billing_date: string
          organization_id: string
          trial_end_date: string
        }
        Returns: string
      }
      create_hms_module: {
        Args: {
          p_bundle_name: string
          p_is_active?: boolean
          p_module_description: string
          p_module_display_name: string
          p_module_monthly_price: number
          p_module_name: string
          p_sort_order: number
        }
        Returns: string
      }
      create_hospital_l02: {
        Args:
          | {
              accreditation_details?: Json
              admin_user_id: string
              billing_cycle: string
              boarding_services?: boolean
              chief_veterinarian_contact?: string
              chief_veterinarian_name?: string
              country: string
              currency: string
              emergency_services?: boolean
              entity_id: string
              entity_platform_id: string
              house_call_services?: boolean
              laboratory_services?: boolean
              language: string
              medical_equipment?: Json
              modules: string[]
              next_billing_date: string
              organization_id: string
              pharmacy_services?: boolean
              practice_type?: string
              radiology_services?: boolean
              surgical_suites?: number
              treatment_rooms?: number
              trial_end_date: string
              veterinary_specialties?: string[]
              waste_management_protocol?: string
            }
          | {
              admin_user_id: string
              billing_cycle: string
              country: string
              currency: string
              entity_id: string
              entity_platform_id: string
              language: string
              modules: string[]
              next_billing_date: string
              organization_id: string
              trial_end_date: string
            }
        Returns: string
      }
      create_module: {
        Args:
          | {
              p_bundle_name: string
              p_is_active?: boolean
              p_module_description: string
              p_module_display_name: string
              p_module_monthly_price: number
              p_module_name: string
              p_solution_type: string
              p_sort_order: number
            }
          | {
              p_is_active: boolean
              p_module_base_price: number
              p_module_description: string
              p_module_display_name: string
              p_module_name: string
              p_payment_frequency: string
              p_solution_type: string
              p_sort_order: number
            }
          | {
              p_is_active: boolean
              p_module_description: string
              p_module_display_name: string
              p_module_monthly_price: number
              p_module_name: string
              p_solution_type: string
              p_sort_order: number
            }
        Returns: string
      }
      create_otp_verification: {
        Args: {
          p_email: string
          p_hospital_id: string
          p_otp_type: string
          p_owner_id?: string
          p_patient_id?: string
          p_phone_number: string
        }
        Returns: string
      }
      create_store_l02: {
        Args: {
          admin_user_id: string
          billing_cycle: string
          country: string
          currency: string
          entity_id: string
          entity_platform_id: string
          language: string
          modules: string[]
          next_billing_date: string
          organization_id: string
          trial_end_date: string
        }
        Returns: string
      }
      crud_coupons: {
        Args: {
          action: string
          coupon_data?: Json
          coupon_id?: string
          filters?: Json
        }
        Returns: Json
      }
      delete_cp_territory: {
        Args: { p_territory_id: string }
        Returns: boolean
      }
      delete_entities: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      delete_entity_by_id: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      delete_hms_module: {
        Args: { p_module_id: string }
        Returns: boolean
      }
      delete_module: {
        Args: { p_module_id: string }
        Returns: boolean
      }
      emr_activation_requires_consent: {
        Args: { p_hospital_id: string; p_patient_id: string }
        Returns: boolean
      }
      entity_has_bundle_access: {
        Args: { _bundle_name: string; _entity_id: string; _entity_type: string }
        Returns: boolean
      }
      entity_has_module_access: {
        Args: { _entity_id: string; _entity_type: string; _module_name: string }
        Returns: boolean
      }
      generate_channel_partner_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_employee_id: {
        Args: { hospital_uuid: string }
        Returns: string
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_otp_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_partner_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_platform_id: {
        Args: { prefix: string; suffix_code: string }
        Returns: string
      }
      generate_short_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_user_display_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_accessible_entities: {
        Args: Record<PropertyKey, never>
        Returns: {
          country: string
          entity_id: string
          entity_name: string
          entity_platform_id: string
          entity_type: string
          is_active: boolean
          organization_id: string
          organization_platform_id: string
        }[]
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cp_partners: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          commission_rate: number
          contact_person: string
          country: string
          created_at: string
          currency: string
          display_id: string
          email: string
          entity_platform_id: string
          id: string
          is_active: boolean
          language: string
          manager_email: string
          name: string
          partner_code: string
          performance_rating: number
          phone: string
          pincode: string
          status: string
          territory_id: string
          total_sales: number
          updated_at: string
        }[]
      }
      get_cp_territories: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_partner_id: string
          assigned_partner_name: string
          cities: string[]
          country: string
          coverage_type: string
          created_at: string
          description: string
          id: string
          market_potential: number
          population: number
          states: string[]
          status: string
          territory_code: string
          territory_name: string
          updated_at: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_entity_details: {
        Args: { p_entity_id: string }
        Returns: {
          address: string
          country: string
          created_at: string
          currency: string
          description: string
          display_id: string
          entity_type: string
          id: string
          is_active: boolean
          language: string
          manager_email: string
          name: string
          organization_platform_id: string
          phone: string
          platform_id: string
          postal_code: string
          updated_at: string
          website: string
        }[]
      }
      get_entity_subscription_modules: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: string[]
      }
      get_estore_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          billing_cycle: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          is_active: boolean
          last_billing_date: string
          next_billing_date: string
          organization_id: string
          subscription_currency: string
          subscription_modules: string[]
          subscription_start_date: string
          subscription_status: string
          trial_end_date: string
          updated_at: string
        }[]
      }
      get_global_breeds: {
        Args: Record<PropertyKey, never>
        Returns: {
          alternative_names: string[]
          apartment_friendly: boolean
          breed_group: string
          coat_colors: string[]
          coat_type: string
          created_at: string
          description: string
          energy_level: string
          good_with_children: boolean
          good_with_pets: boolean
          id: string
          is_active: boolean
          name: string
          origin_country: string
          size_category: string
          species_id: string
          temperament_traits: string[]
          updated_at: string
          weight_range_max: number
          weight_range_min: number
        }[]
      }
      get_global_channel_partners: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          commission_rate: number
          contact_person: string
          country: string
          created_at: string
          currency: string
          display_id: string
          email: string
          entity_platform_id: string
          id: string
          is_active: boolean
          language: string
          manager_email: string
          name: string
          partner_code: string
          performance_rating: number
          phone: string
          pincode: string
          status: string
          territory_id: string
          total_sales: number
          updated_at: string
        }[]
      }
      get_global_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          country: string
          created_at: string
          currency: string
          display_id: string
          entity_type: string
          id: string
          is_active: boolean
          language: string
          manager_email: string
          name: string
          organization_platform_id: string
          pincode: string
          platform_id: string
          updated_at: string
        }[]
      }
      get_global_pets: {
        Args: Record<PropertyKey, never>
        Returns: {
          age: number
          breed: string
          color: string
          created_at: string
          date_of_birth: string
          gender: string
          id: string
          is_active: boolean
          microchip_id: string
          name: string
          pet_platform_id: string
          species: string
          updated_at: string
          user_id: string
          user_platform_id: string
          weight: number
        }[]
      }
      get_global_pets_onboarding: {
        Args: { pet_ids: string[] }
        Returns: {
          hospital_id: string
          pet_id: string
        }[]
      }
      get_global_profiles: {
        Args: { user_ids: string[] }
        Returns: {
          email: string
          first_name: string
          last_name: string
          phone: string
          user_id: string
        }[]
      }
      get_global_species: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_lifespan_max: number
          average_lifespan_min: number
          category: string
          created_at: string
          diet_type: string
          id: string
          is_active: boolean
          is_domestic: boolean
          name: string
          scientific_name: string
          updated_at: string
        }[]
      }
      get_global_user_profiles: {
        Args: { p_organization_id?: string; p_user_id?: string }
        Returns: {
          address: string
          city: string
          consent_method: string
          consent_verified: boolean
          consent_verified_at: string
          country: string
          created_at: string
          date_of_birth: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          first_name: string
          is_active: boolean
          is_approved: boolean
          last_name: string
          marketing_consent: boolean
          marketing_consent_date: string
          notes: string
          phone: string
          postal_code: string
          preferred_language: string
          state: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
          user_platform_id: string
        }[]
      }
      get_hms_modules_tree_data: {
        Args: { p_entity_type?: string }
        Returns: {
          bundle_description: string
          bundle_display_name: string
          bundle_name: string
          id: string
          is_active: boolean
          solution_type: string
          sort_order: number
          total_modules: number
          total_price: number
        }[]
      }
      get_hospital_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          billing_cycle: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          is_active: boolean
          last_billing_date: string
          next_billing_date: string
          organization_id: string
          subscription_currency: string
          subscription_modules: string[]
          subscription_start_date: string
          subscription_status: string
          trial_end_date: string
          updated_at: string
        }[]
      }
      get_modules_bundles_data: {
        Args: { p_is_active?: boolean; p_solution_type?: string }
        Returns: {
          bundle_description: string
          bundle_display_name: string
          bundle_name: string
          id: string
          is_active: boolean
          module_description: string
          module_display_name: string
          module_monthly_price: number
          module_name: string
          solution_type: string
          sort_order: number
          updated_at: string
        }[]
      }
      get_modules_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          base_price: number
          id: string
          is_active: boolean
          module_description: string
          module_display_name: string
          module_name: string
          payment_frequency: string
          solution_type: string
          sort_order: number
          updated_at: string
        }[]
      }
      get_organization_details: {
        Args: { p_organization_id: string }
        Returns: {
          accent_color: string
          accreditation_body: string
          accreditation_details: Json
          accreditations: Json
          address: string
          assigned_manager_id: string
          business_registration_number: string
          certificate_of_incorporation_url: string
          certification_date: string
          city: string
          contact_person: string
          country: string
          created_at: string
          currency: string
          display_name: string
          email: string
          emergency_contact_number: string
          entity_id: string
          entity_name: string
          entity_platform_id: string
          entity_type: string
          incorporation_date: string
          language: string
          license_expiry_date: string
          license_number: string
          licenses: Json
          logo_url: string
          manager_name: string
          notes: string
          organization_id: string
          organization_platform_id: string
          phone: string
          postal_code: string
          primary_color: string
          state: string
          status: string
          updated_at: string
          vat_gst_number: string
          website: string
        }[]
      }
      get_organization_entities: {
        Args: { p_organization_id: string }
        Returns: {
          country: string
          created_at: string
          currency: string
          entity_address: string
          entity_id: string
          entity_name: string
          entity_pincode: string
          entity_platform_id: string
          entity_type: string
          is_active: boolean
          language: string
          manager_email: string
        }[]
      }
      get_organizations_entities: {
        Args: { p_include_deleted?: boolean }
        Returns: {
          accreditation_details: Json
          address: string
          city: string
          company_name: string
          contact_person: string
          country: string
          created_at: string
          currency: string
          display_id: string
          email: string
          emergency_contact_number: string
          entity_metadata: Json
          entity_platform_id: string
          entity_type: string
          entitytype: string
          id: string
          is_active: boolean
          language: string
          manager_email: string
          manager_name: string
          name: string
          notes: string
          phone: string
          postal_code: string
          state: string
          status: string
          store_type: string
          subscription_status: string
          updated_at: string
          vat_gst_number: string
          website: string
        }[]
      }
      get_platform_admin_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          first_name: string
          is_active: boolean
          last_name: string
          role_name: string
          user_id: string
        }[]
      }
      get_platform_managers: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_at: string
          department: string
          email: string
          first_name: string
          is_active: boolean
          is_approved: boolean
          last_name: string
          phone: string
          role_name: string
          user_id: string
          user_platform_id: string
        }[]
      }
      get_pstore_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          billing_cycle: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          is_active: boolean
          last_billing_date: string
          next_billing_date: string
          organization_id: string
          subscription_currency: string
          subscription_modules: string[]
          subscription_start_date: string
          subscription_status: string
          trial_end_date: string
          updated_at: string
        }[]
      }
      get_platform_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          privilege_level: number
          role_display_name: string
          role_name: string
          updated_at: string
        }[]
      }
      get_user_accessible_hospitals: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_admin_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_directory: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          entity_id: string
          entity_name: string
          entity_type: string
          first_name: string
          is_approved: boolean
          last_name: string
          organization_id: string
          organization_name: string
          privilege_level: string
          role_name: string
          user_id: string
        }[]
      }
      get_user_email_by_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_entity_details: {
        Args: { p_user_id: string }
        Returns: {
          address: string
          city: string
          country: string
          email: string
          entity_id: string
          entity_name: string
          entity_platform_id: string
          entity_type: string
          is_active: boolean
          phone: string
          postal_code: string
          state: string
          website: string
        }[]
      }
      get_user_full_name: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_organization_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_pets_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_primary_hospital_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_primary_organization_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_primary_role: {
        Args: { p_user_id: string }
        Returns: {
          display_name: string
          privilege_level: string
          role_name: string
        }[]
      }
      get_user_privilege_level: {
        Args: { user_email: string; user_role: string }
        Returns: string
      }
      get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          email: string
          first_name: string
          id: string
          is_approved: boolean
          last_name: string
          user_platform_id: string
        }[]
      }
      get_user_roles: {
        Args: { p_hospital_id?: string; p_user_id: string }
        Returns: {
          category: string
          department: string
          display_name: string
          hospital_id: string
          level: number
          role_id: string
          role_name: string
        }[]
      }
      get_user_roles_for_context: {
        Args: {
          p_hospital_id?: string
          p_organization_id?: string
          p_user_id: string
        }
        Returns: {
          assigned_at: string
          department: string
          expires_at: string
          is_active: boolean
          role_category: string
          role_label: string
          role_value: string
        }[]
      }
      has_admin_tier_or_higher: {
        Args: { required_tier: string; user_uuid: string }
        Returns: boolean
      }
      has_entity_admin_privileges: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_org_admin_privileges: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_privilege_level_or_higher: {
        Args: { required_level: string }
        Returns: boolean
      }
      initialize_hospital_roles: {
        Args: { p_hospital_id: string }
        Returns: undefined
      }
      insert_global_breed: {
        Args: {
          p_alternative_names?: string[]
          p_apartment_friendly?: boolean
          p_breed_group?: string
          p_coat_colors?: string[]
          p_coat_type?: string
          p_description?: string
          p_energy_level?: string
          p_good_with_children?: boolean
          p_good_with_pets?: boolean
          p_name: string
          p_origin_country?: string
          p_size_category?: string
          p_species_id: string
          p_temperament_traits?: string[]
          p_weight_range_max?: number
          p_weight_range_min?: number
        }
        Returns: string
      }
      insert_global_organization_entity: {
        Args: {
          p_address?: string
          p_country: string
          p_currency: string
          p_email?: string
          p_entity_name: string
          p_entity_platform_id: string
          p_entity_type: string
          p_language: string
          p_organization_id: string
          p_organization_platform_id: string
          p_phone?: string
          p_status?: string
          p_website?: string
        }
        Returns: string
      }
      insert_global_species: {
        Args: {
          p_average_lifespan_max?: number
          p_average_lifespan_min?: number
          p_category?: string
          p_description?: string
          p_diet_type?: string
          p_is_domestic?: boolean
          p_name: string
          p_scientific_name?: string
        }
        Returns: string
      }
      invite_hospital_manager: {
        Args: {
          hospital_id: string
          invited_by: string
          manager_email: string
          org_id: string
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_pet_checked_in: {
        Args: { pet_uuid: string }
        Returns: boolean
      }
      is_pet_onboarded_to_hospital: {
        Args: { hospital_uuid: string; pet_uuid: string }
        Returns: boolean
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_admin_by_email: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_pet_owner: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      migrate_permissions_to_modules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_single_accreditations_to_multiple: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_single_licenses_to_multiple: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      populate_hospital_with_standards: {
        Args: { hospital_id_param: string }
        Returns: undefined
      }
      populate_pets_and_owners: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      populate_purchasing_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_user_role: {
        Args: { p_system_role_id: string; p_user_id: string }
        Returns: boolean
      }
      sync_bed_occupancy_with_inpatients: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_employee_master_with_role: {
        Args: { employee_uuid: string; role_assignment_uuid: string }
        Returns: boolean
      }
      sync_employee_platform_roles: {
        Args: { p_role_names: string[]; p_user_id: string }
        Returns: boolean
      }
      update_bundle_base_prices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_cp_territory: {
        Args:
          | {
              p_assigned_partner_id?: string
              p_cities?: string[]
              p_country: string
              p_coverage_type: string
              p_description?: string
              p_market_potential?: number
              p_population?: number
              p_states?: string[]
              p_status: string
              p_territory_code: string
              p_territory_id: string
              p_territory_name: string
            }
          | {
              p_assigned_partner_id?: string
              p_cities?: string[]
              p_country: string
              p_coverage_type?: string
              p_description?: string
              p_established_date?: string
              p_id: string
              p_market_potential?: number
              p_notes?: string
              p_population?: number
              p_postal_codes?: string[]
              p_states_provinces?: string[]
              p_status?: string
              p_territory_code: string
              p_territory_manager_id?: string
              p_territory_name: string
            }
        Returns: boolean
      }
      update_entity: {
        Args: {
          p_accent_color?: string
          p_address?: string
          p_city?: string
          p_country?: string
          p_currency?: string
          p_description?: string
          p_display_name?: string
          p_email?: string
          p_emergency_contact_number?: string
          p_entity_id: string
          p_entity_name?: string
          p_entity_type: string
          p_language?: string
          p_logo_url?: string
          p_manager_name?: string
          p_notes?: string
          p_phone?: string
          p_primary_color?: string
          p_state?: string
          p_website?: string
        }
        Returns: boolean
      }
      update_entity_branding: {
        Args: {
          p_accent_color?: string
          p_brand_name?: string
          p_entity_id: string
          p_logo_file_path?: string
          p_logo_url?: string
          p_primary_color?: string
          p_secondary_color?: string
        }
        Returns: boolean
      }
      update_entity_subscription_modules: {
        Args: {
          p_additional_cost?: number
          p_entity_id: string
          p_entity_type: string
          p_modules: string[]
        }
        Returns: boolean
      }
      update_global_breed: {
        Args: {
          p_alternative_names?: string[]
          p_apartment_friendly?: boolean
          p_breed_group?: string
          p_breed_id: string
          p_coat_colors?: string[]
          p_coat_type?: string
          p_description?: string
          p_energy_level?: string
          p_good_with_children?: boolean
          p_good_with_pets?: boolean
          p_name: string
          p_origin_country?: string
          p_size_category?: string
          p_temperament_traits?: string[]
          p_weight_range_max?: number
          p_weight_range_min?: number
        }
        Returns: boolean
      }
      crud_entity_master_l01: {
        Args: {
          operation: string
          p_entity_id?: string
          p_entity_name?: string
          p_display_name?: string
          p_entity_type?: string
          p_organization_id?: string
          p_is_active?: string
          p_description?: string
          p_billing_email?: string
          p_vat_gst_number?: string
          p_address?: string
          p_city?: string
          p_state?: string
          p_postal_code?: string
          p_country?: string
          p_phone?: string
          p_email?: string
          p_website?: string
          p_contact_person?: string
          p_assigned_manager_id?: string
          p_assigned_manager_contact?: string
          p_currency?: string
          p_language?: string
          p_emergency_contact_number?: string
          p_notes?: string
          p_accent_color?: string
        }
        Returns: Json
      }
      update_global_species: {
        Args: {
          p_average_lifespan_max?: number
          p_average_lifespan_min?: number
          p_category?: string
          p_description?: string
          p_diet_type?: string
          p_is_domestic?: boolean
          p_name: string
          p_scientific_name?: string
          p_species_id: string
        }
        Returns: boolean
      }
      update_hms_module: {
        Args: {
          p_is_active: boolean
          p_module_description: string
          p_module_display_name: string
          p_module_id: string
          p_module_monthly_price: number
          p_module_name: string
          p_sort_order: number
        }
        Returns: boolean
      }
      update_module: {
        Args:
          | {
              p_bundle_name: string
              p_is_active: boolean
              p_module_description: string
              p_module_display_name: string
              p_module_id: string
              p_module_monthly_price: number
              p_module_name: string
              p_solution_type: string
              p_sort_order: number
            }
          | {
              p_is_active: boolean
              p_module_base_price: number
              p_module_description: string
              p_module_display_name: string
              p_module_id: string
              p_module_name: string
              p_payment_frequency: string
              p_solution_type: string
              p_sort_order: number
            }
          | {
              p_is_active: boolean
              p_module_description: string
              p_module_display_name: string
              p_module_id: string
              p_module_monthly_price: number
              p_module_name: string
              p_solution_type: string
              p_sort_order: number
            }
        Returns: boolean
      }
      update_organization_accreditations: {
        Args: { p_accreditations: Json; p_organization_id: string }
        Returns: boolean
      }
      update_organization_field: {
        Args: {
          p_field_name: string
          p_field_value: string
          p_organization_id: string
        }
        Returns: boolean
      }
      update_organization_licenses: {
        Args: { p_licenses: Json; p_organization_id: string }
        Returns: boolean
      }
      update_user_approval_status: {
        Args: { approved: boolean; target_user_id: string }
        Returns: boolean
      }
      user_can_access_channel: {
        Args: { _channel_id: string; _user_id: string }
        Returns: boolean
      }
      user_can_create_channel: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_can_manage_channel_membership: {
        Args: { _channel_id: string; _user_id: string }
        Returns: boolean
      }
      user_can_manage_entity: {
        Args: { entity_organization_id: string }
        Returns: boolean
      }
      user_has_employee_access: {
        Args: { target_employee_id: string }
        Returns: boolean
      }
      user_has_enrollment_access: {
        Args: { target_enrollment_id: string }
        Returns: boolean
      }
      user_has_hospital_access: {
        Args: { target_hospital_id: string }
        Returns: boolean
      }
      user_has_module_access: {
        Args: {
          p_hospital_id?: string
          p_module_name: string
          p_user_id: string
        }
        Returns: boolean
      }
      user_has_module_permission: {
        Args: {
          p_hospital_id?: string
          p_module_name: string
          p_permission: string
          p_user_id: string
        }
        Returns: boolean
      }
      user_has_permission: {
        Args: {
          p_hospital_id?: string
          p_permission_name: string
          p_user_id: string
        }
        Returns: boolean
      }
      user_has_role_in_context: {
        Args:
          | {
              p_hospital_id?: string
              p_organization_id?: string
              p_role_value: string
              p_user_id: string
            }
          | { p_hospital_id?: string; p_role_name: string; p_user_id: string }
        Returns: boolean
      }
      validate_user_roles_privilege_levels: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_privilege_level: string
          department: string
          is_valid: boolean
          role_id: string
          role_label: string
          role_value: string
          validation_message: string
        }[]
      }
      verify_otp: {
        Args: {
          p_ip_address?: unknown
          p_otp_code: string
          p_otp_id: string
          p_user_agent?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      partner_status: "active" | "inactive" | "pending" | "suspended"
      partner_tier: "gold" | "silver" | "bronze" | "standard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      partner_status: ["active", "inactive", "pending", "suspended"],
      partner_tier: ["gold", "silver", "bronze", "standard"],
    },
  },
} as const
