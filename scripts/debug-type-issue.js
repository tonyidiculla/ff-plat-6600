import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testTypeIssue() {
  console.log('Testing for type issues in organization update...\n');
  
  const organizationId = "639e9d01-756f-4776-80ed-075e5cedefb6";

  try {
    // Test 1: Try with minimal parameters first
    console.log('1. Testing minimal update...');
    const { data: result1, error: error1 } = await supabase
      .rpc('crud_entity_master_l01', {
        operation: 'UPDATE',
        p_entity_id: organizationId,
        p_notes: 'Simple test update'
      });

    if (error1) {
      console.error('Minimal update error:', error1);
    } else {
      console.log('[OK] Minimal update works');
    }

    // Test 2: Try with text fields that might cause issues
    console.log('\n2. Testing with text fields...');
    const { data: result2, error: error2 } = await supabase
      .rpc('crud_entity_master_l01', {
        operation: 'UPDATE',
        p_entity_id: organizationId,
        p_billing_email: 'test@example.com',
        p_vat_gst_number: 'TEST123',
        p_description: 'Test description'
      });

    if (error2) {
      console.error('Text fields error:', error2);
    } else {
      console.log('[OK] Text fields work');
    }

    // Test 3: Try with UUID fields that might cause issues
    console.log('\n3. Testing with potentially problematic UUID fields...');
    const { data: result3, error: error3 } = await supabase
      .rpc('crud_entity_master_l01', {
        operation: 'UPDATE',
        p_entity_id: organizationId,
        p_assigned_manager_id: null,
        p_notes: 'Testing UUID fields'
      });

    if (error3) {
      console.error('UUID fields error:', error3);
    } else {
      console.log('[OK] UUID fields work');
    }

    // Test 4: Try with boolean field
    console.log('\n4. Testing with boolean field...');
    const { data: result4, error: error4 } = await supabase
      .rpc('crud_entity_master_l01', {
        operation: 'UPDATE',
        p_entity_id: organizationId,
        p_is_active: 'active',
        p_notes: 'Testing boolean field'
      });

    if (error4) {
      console.error('Boolean field error:', error4);
    } else {
      console.log('[OK] Boolean field works');
    }

    // Test 5: Try exactly what the frontend is doing
    console.log('\n5. Testing frontend-like parameters...');
    const { data: result5, error: error5 } = await supabase
      .rpc('crud_entity_master_l01', {
        operation: 'UPDATE',
        p_entity_id: organizationId,
        p_entity_name: 'Test Update',
        p_billing_email: 'test@example.com',
        p_vat_gst_number: 'TEST123',
        p_assigned_manager_id: '',  // Empty string might cause issues
        p_assigned_manager_contact: '',
        p_notes: 'Testing frontend params',
        p_description: 'Frontend test'
      });

    if (error5) {
      console.error('Frontend-like error:', error5);
    } else {
      console.log('[OK] Frontend-like parameters work');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testTypeIssue();