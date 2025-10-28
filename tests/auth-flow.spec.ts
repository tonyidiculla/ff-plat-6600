import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cookies/storage before each test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should redirect to auth service when not authenticated', async ({ page }) => {
    // Navigate to the platform
    await page.goto('/');
    
    // Should be redirected to auth service
    await expect(page).toHaveURL(/localhost:6800/);
    
    // Should have redirect parameter pointing back to platform
    const url = new URL(page.url());
    expect(url.searchParams.get('redirect')).toContain('localhost:6600');
  });

  test('should successfully complete authentication flow', async ({ page, context }) => {
    // Start at the platform
    const response = page.goto('/');
    
    // Wait for redirect to auth service
    await page.waitForURL(/localhost:6800/);
    
    // Verify we're on the auth service
    expect(page.url()).toContain('localhost:6800');
    
    // Mock successful authentication by setting cookies
    // This simulates what the auth service would do after successful login
    await context.addCookies([
      {
        name: 'sb-kzokffftffgdmrughkfv-auth-token',
        value: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour from now
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        }),
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Navigate back to platform with auth cookie
    await page.goto('http://localhost:6600');
    
    // Should now be allowed through without redirect
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:6600');
    
    // Should not be redirected to auth service
    await page.waitForTimeout(2000); // Wait to ensure no redirect happens
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should handle URL with auth tokens', async ({ page }) => {
    // Simulate return from auth service with tokens in URL
    const authUrl = 'http://localhost:6600/?access_token=mock-token&refresh_token=mock-refresh&token_type=bearer';
    
    await page.goto(authUrl);
    
    // Should be allowed through due to token parameters
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:6600');
    
    // Should not redirect to auth service
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should handle redirect parameter from auth service', async ({ page }) => {
    // Simulate redirect back from auth service
    const redirectUrl = 'http://localhost:6600/?redirect=http://localhost:6600/dashboard';
    
    await page.goto(redirectUrl);
    
    // Should be allowed through due to redirect parameter
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:6600');
    
    // Should not redirect to auth service
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should allow client navigation from same origin', async ({ page, context }) => {
    // Set up authenticated state
    await context.addCookies([
      {
        name: 'sb-kzokffftffgdmrughkfv-auth-token',
        value: JSON.stringify({
          access_token: 'mock-access-token',
          user: { id: 'test-user' }
        }),
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Navigate to platform
    await page.goto('http://localhost:6600');
    await page.waitForLoadState('networkidle');
    
    // Simulate client-side navigation by adding referer header
    await page.goto('http://localhost:6600/dashboard', {
      referer: 'http://localhost:6600'
    });
    
    // Should stay on platform without redirect
    expect(page.url()).toContain('localhost:6600/dashboard');
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should allow navigation from auth service', async ({ page }) => {
    // Simulate navigation from auth service back to platform
    await page.goto('http://localhost:6600', {
      referer: 'http://localhost:6800'
    });
    
    // Should be allowed through due to referer from auth service
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:6600');
    
    // Should not redirect back to auth service
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should respect public paths', async ({ page }) => {
    // Navigate to healthcheck endpoint (public path)
    await page.goto('/healthcheck');
    
    // Should be allowed through without redirect
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:6600/healthcheck');
    
    // Should not redirect to auth service
    expect(page.url()).not.toContain('localhost:6800');
  });

  test('should allow Next.js internal routes', async ({ page }) => {
    // Try to access Next.js internal route
    const response = await page.goto('/_next/static/chunks/webpack.js', {
      waitUntil: 'networkidle'
    });
    
    // Should not redirect these requests
    expect(page.url()).toContain('_next');
    expect(page.url()).not.toContain('localhost:6800');
  });
});