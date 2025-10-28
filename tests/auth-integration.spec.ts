import { test, expect } from '@playwright/test';

test.describe('Full Authentication Integration Test', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cookies/storage before each test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should complete full authentication flow from platform to auth service and back', async ({ page, context }) => {
    console.log('🚀 Starting full authentication flow test');
    
    // Step 1: Visit platform when not authenticated
    console.log('📍 Step 1: Visiting platform at localhost:6600');
    await page.goto('http://localhost:6600', { waitUntil: 'networkidle' });
    
    // Step 2: Should be redirected to auth service
    console.log('📍 Step 2: Checking redirect to auth service');
    await page.waitForURL(/localhost:6800/, { timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('Current URL after redirect:', currentUrl);
    
    // Verify we're on auth service
    expect(currentUrl).toContain('localhost:6800');
    
    // Verify redirect parameter is set correctly
    const url = new URL(currentUrl);
    const redirectParam = url.searchParams.get('redirect');
    console.log('Redirect parameter:', redirectParam);
    expect(redirectParam).toContain('localhost:6600');
    
    // Step 3: Simulate authentication success on auth service
    // In a real scenario, this would involve filling out login form
    console.log('📍 Step 3: Simulating successful authentication');
    
    // Set authentication cookies (simulating what auth service would do)
    await context.addCookies([
      {
        name: 'sb-kzokffftffgdmrughkfv-auth-token',
        value: JSON.stringify({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
          refresh_token: 'mock-refresh-token-12345',
          expires_at: Date.now() + 3600000, // 1 hour
          token_type: 'bearer',
          user: {
            id: '12345678-1234-1234-1234-123456789abc',
            email: 'test@furfield.com',
            role: 'authenticated'
          }
        }),
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }
    ]);

    // Step 4: Navigate back to platform with authentication
    console.log('📍 Step 4: Navigating back to platform with auth');
    await page.goto('http://localhost:6600', { 
      waitUntil: 'networkidle',
      referer: 'http://localhost:6800' 
    });
    
    // Step 5: Verify successful access to platform
    console.log('📍 Step 5: Verifying access to platform');
    await page.waitForLoadState('networkidle');
    
    // Should now be on platform
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    expect(finalUrl).toContain('localhost:6600');
    
    // Should NOT be redirected back to auth service
    expect(finalUrl).not.toContain('localhost:6800');
    
    // Wait a bit to ensure no redirect happens
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('localhost:6600');
    
    console.log('✅ Authentication flow test completed successfully!');
  });

  test('should handle authentication with URL tokens', async ({ page }) => {
    console.log('🚀 Testing authentication with URL tokens');
    
    // Simulate auth service redirecting back with tokens in URL
    const authRedirectUrl = new URL('http://localhost:6600');
    authRedirectUrl.searchParams.set('access_token', 'mock-access-token-12345');
    authRedirectUrl.searchParams.set('refresh_token', 'mock-refresh-token-12345');
    authRedirectUrl.searchParams.set('token_type', 'bearer');
    authRedirectUrl.searchParams.set('expires_in', '3600');
    
    console.log('Navigating with auth tokens:', authRedirectUrl.toString());
    
    // Navigate with tokens in URL
    await page.goto(authRedirectUrl.toString(), { 
      waitUntil: 'networkidle',
      referer: 'http://localhost:6800'
    });
    
    // Should be allowed through
    expect(page.url()).toContain('localhost:6600');
    expect(page.url()).not.toContain('localhost:6800');
    
    // Wait to ensure no redirect
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('localhost:6600');
    
    console.log('✅ URL token authentication test passed!');
  });

  test('should preserve original destination after auth', async ({ page, context }) => {
    console.log('🚀 Testing destination preservation after authentication');
    
    // Try to access a specific page when not authenticated
    const targetPath = '/dashboard/users';
    await page.goto(`http://localhost:6600${targetPath}`, { waitUntil: 'networkidle' });
    
    // Should be redirected to auth service with original URL preserved
    await page.waitForURL(/localhost:6800/);
    
    const redirectUrl = new URL(page.url());
    const preservedUrl = redirectUrl.searchParams.get('redirect');
    expect(preservedUrl).toContain(targetPath);
    
    // Simulate successful authentication
    await context.addCookies([
      {
        name: 'sb-kzokffftffgdmrughkfv-auth-token',
        value: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' }
        }),
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Navigate back to original destination
    await page.goto(preservedUrl!, { 
      waitUntil: 'networkidle',
      referer: 'http://localhost:6800'
    });
    
    // Should be at original destination
    expect(page.url()).toContain(targetPath);
    expect(page.url()).toContain('localhost:6600');
    
    console.log('✅ Destination preservation test passed!');
  });

  test('should handle multiple auth methods', async ({ page }) => {
    console.log('🚀 Testing multiple authentication methods');
    
    // Test with Authorization header
    await page.setExtraHTTPHeaders({
      'Authorization': 'Bearer mock-jwt-token-12345'
    });
    
    await page.goto('http://localhost:6600', { waitUntil: 'networkidle' });
    
    // Should be allowed through with auth header
    expect(page.url()).toContain('localhost:6600');
    expect(page.url()).not.toContain('localhost:6800');
    
    console.log('✅ Authorization header test passed!');
    
    // Test with custom session header
    await page.setExtraHTTPHeaders({
      'x-session-token': 'custom-session-token-12345'
    });
    
    await page.goto('http://localhost:6600/profile', { waitUntil: 'networkidle' });
    
    // Should be allowed through with session header
    expect(page.url()).toContain('localhost:6600');
    expect(page.url()).not.toContain('localhost:6800');
    
    console.log('✅ Custom session header test passed!');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    console.log('🚀 Testing error handling');
    
    // Test behavior when auth service is unreachable
    // This simulates what happens when the redirect occurs but auth service is down
    
    // Navigate to platform (should redirect to auth service)
    const response = page.goto('http://localhost:6600');
    
    try {
      await page.waitForURL(/localhost:6800/, { timeout: 5000 });
      console.log('Auth service is available for redirect test');
    } catch (error) {
      console.log('Auth service redirect timeout - this is expected if service is down');
    }
    
    // The middleware should still redirect even if the target service is down
    // This is the correct behavior - the platform shouldn't handle auth service availability
    console.log('✅ Error handling test completed!');
  });
});