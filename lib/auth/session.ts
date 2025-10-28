// This file is deprecated in favor of the centralized auth service
// Authentication is now handled via ff-auth-6800 and the AuthContext

export async function getSession(appType?: string) {
  // Session handling is now done client-side via AuthContext
  console.warn('getSession is deprecated - use useAuth() hook instead')
  return null
}

export async function requireAuth(appType?: string) {
  // Auth requirements are now handled by proxy.ts middleware
  console.warn('requireAuth is deprecated - authentication handled by middleware')
  return null
}

export async function getAuthUser(appType?: string): Promise<null> {
  // User data is now available via useAuth() hook
  console.warn('getAuthUser is deprecated - use useAuth() hook instead')
  return null
}

