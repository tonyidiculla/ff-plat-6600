import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/'];
const publicRoutes = ['/api/health', '/healthcheck'];

// Simple in-memory cache for token verification (valid for 30 seconds)
const tokenCache = new Map<string, { valid: boolean; expires: number }>();

async function verifyToken(token: string): Promise<boolean> {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    console.log('[Platform Middleware] Using cached token verification');
    return cached.valid;
  }

  try {
    // Verify token with ff-auth service (the single source of truth)
    const response = await fetch('http://localhost:6800/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const isValid = response.ok;
    
    // Cache the result for 30 seconds
    tokenCache.set(token, {
      valid: isValid,
      expires: Date.now() + 30000,
    });
    
    return isValid;
  } catch (error) {
    console.error('[Platform Middleware] Token verification failed:', error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  console.log('[Platform Proxy] Request:', pathname);
  
  // Allow public routes (health checks, etc.)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    console.log('[Platform Middleware] Public route, allowing access');
    return NextResponse.next();
  }
  
  // Check for authentication token in cookies OR URL query parameter
  let token = request.cookies.get('furfield_token')?.value;
  const tokenFromUrl = searchParams.get('token');
  
  // If token in URL but not in cookie, use URL token and set cookie
  if (!token && tokenFromUrl) {
    token = tokenFromUrl;
    console.log('[Platform Middleware] Token found in URL, will set cookie');
  }
  
  console.log('[Platform Middleware] Token found:', !!token);
  
  if (!token) {
    console.log('[Platform Middleware] No token found, redirecting to auth');
    // No token - redirect to ff-auth
    const loginUrl = new URL('http://localhost:6800/login');
    loginUrl.searchParams.set('returnUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  const isValid = await verifyToken(token);
  console.log('[Platform Middleware] Token valid:', isValid);
  
  if (!isValid) {
    console.log('[Platform Middleware] Invalid token, redirecting to auth');
    // Invalid token - clear cookies and redirect to ff-auth
    const loginUrl = new URL('http://localhost:6800/login');
    loginUrl.searchParams.set('returnUrl', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('furfield_token');
    response.cookies.delete('furfield_user');
    return response;
  }
  
  console.log('[Platform Proxy] Token valid, allowing access');
  
  // If token was from URL, set it as cookie and redirect to clean URL
  if (tokenFromUrl) {
    console.log('[Platform Proxy] Token from URL, setting cookie and redirecting');
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.set('furfield_token', token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
    });
    console.log('[Platform Proxy] Cookie set, redirecting to:', pathname);
    return response;
  }
  
  console.log('[Platform Proxy] Token from cookie, allowing access');
  // Valid token - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};
