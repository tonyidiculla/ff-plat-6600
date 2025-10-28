import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteAdminRequest {
  email: string;
  first_name: string;
  last_name: string;
  designation: string;
  role_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { email, first_name, last_name, designation, role_name }: InviteAdminRequest = await req.json();

    console.log('Creating platform admin invitation for:', { email, first_name, last_name, designation, role_name });

    // Generate user_platform_id from platform_id_categories
    const { data: platformIdData, error: platformIdError } = await supabase
      .schema('global')
      .from('platform_id_categories')
      .select('category_code, type_code')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (platformIdError) {
      console.error('Error fetching platform ID categories:', platformIdError);
      throw new Error('Failed to generate platform ID');
    }

    // Generate random user_platform_id
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const user_platform_id = `${platformIdData.category_code}-${platformIdData.type_code}-${randomNum}`;

    // Create user in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        designation,
        user_platform_id
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    console.log('User created successfully:', userData.user.id);

    // Create profile in global.profiles
    const { error: profileError } = await supabase
      .schema('global')
      .from('profiles')
      .insert({
        user_id: userData.user.id,
        user_platform_id,
        first_name,
        last_name,
        email,
        is_active: true,
        is_approved: true
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('Profile created successfully');

    // Get platform role ID
    const { data: roleData, error: roleError } = await supabase
      .schema('global')
      .from('platform_roles')
      .select('id')
      .eq('role_name', role_name)
      .eq('is_active', true)
      .single();

    if (roleError) {
      console.error('Error fetching role:', roleError);
      throw new Error(`Failed to find role: ${role_name}`);
    }

    // Create user role assignment
    const { error: roleAssignmentError } = await supabase
      .schema('global')
      .from('user_role_assignments')
      .insert({
        user_id: userData.user.id,
        user_platform_id,
        platform_role_id: roleData.id,
        is_active: true,
        assigned_by: userData.user.id
      });

    if (roleAssignmentError) {
      console.error('Error creating role assignment:', roleAssignmentError);
      throw new Error(`Failed to create role assignment: ${roleAssignmentError.message}`);
    }

    console.log('Role assignment created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Platform admin invited successfully',
        user_id: userData.user.id,
        user_platform_id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in invite-platform-admin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to invite platform admin',
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);