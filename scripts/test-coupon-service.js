import { CouponService } from '../src/shared/services/couponService.js';

async function testCouponService() {
  console.log('[lab] Testing Coupon Service...\n');

  try {
    // Test 1: Get all coupons
    console.log('1 Testing getCoupons()...');
    const couponsResult = await CouponService.getCoupons();
    console.log('   Result:', couponsResult.success ? '[OK] Success' : '[ERROR] Failed');
    if (!couponsResult.success) {
      console.log('   Error:', couponsResult.error);
    } else {
      console.log('   Data:', couponsResult.data?.length || 0, 'coupons found');
    }

    // Test 2: Get coupon statistics
    console.log('\n2 Testing getCouponStats()...');
    const statsResult = await CouponService.getCouponStats();
    console.log('   Result:', statsResult.success ? '[OK] Success' : '[ERROR] Failed');
    if (!statsResult.success) {
      console.log('   Error:', statsResult.error);
    } else {
      console.log('   Stats:', statsResult.data);
    }

    // Test 3: Validate a coupon (will fail if no coupons exist)
    console.log('\n3 Testing validateCoupon()...');
    const validationResult = await CouponService.validateCoupon('TESTCODE');
    console.log('   Result:', validationResult.valid ? '[OK] Valid' : '[ERROR] Invalid');
    console.log('   Message:', validationResult.error_message || 'No error');

    console.log('\n[OK] Coupon Service test completed!');
    
  } catch (error) {
    console.error('[ERROR] Test failed:', error);
  }
}

// Note: This test requires the migration to be applied first
console.log('[warn]  Note: This test requires the database migration to be applied first.');
console.log('[clipboard] Steps to run migration:');
console.log('1. Copy SQL from supabase/migrations/20240927000001_replace_coupon_functions_with_crud.sql');
console.log('2. Go to Supabase Dashboard > SQL Editor');
console.log('3. Paste and execute the SQL');
console.log('4. Then run: node scripts/test-coupon-service.js\n');

testCouponService().catch(console.error);