'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { FurfieldLogo } from '@/components/FurfieldLogo'
import { createClient } from '@/lib/supabase/client'

interface StandardizedHeaderProps {
  title?: string
  subtitle?: string
  homeRoute?: string
}

export type { StandardizedHeaderProps }

export function StandardizedHeader({ 
  title = 'Platform Administration', 
  subtitle = 'Platform Management Portal',
  homeRoute = '/'
}: StandardizedHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [menuError, setMenuError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('Platform Admin')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
    // Debug user changes
  useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [StandardizedHeader] User changed:`, user)
    console.log(`[${timestamp}] [StandardizedHeader] User id:`, user?.id)
    console.log(`[${timestamp}] [StandardizedHeader] User email:`, user?.email)
    
    // If user is not authenticated and we're not in the process of restoring session,
    // redirect to auth service after a short delay to allow session restoration to complete
    const hasTokens = searchParams.get('access_token') && searchParams.get('refresh_token')
    console.log(`[${timestamp}] [StandardizedHeader] Redirect check:`, { user: !!user, hasTokens })
    
    // For debugging: don't redirect, just show placeholders
    // if (!user && !hasTokens) {
    //   console.log(`[${timestamp}] [StandardizedHeader] No user and no tokens, will redirect to auth service in 2 seconds...`)
    //   setTimeout(() => {
    //     // Double-check that we still don't have a user
    //     console.log(`[${new Date().toISOString()}] [StandardizedHeader] Timeout check - user:`, !!user)
    //     if (!user) {
    //       console.log(`[${new Date().toISOString()}] [StandardizedHeader] Still no user after delay, redirecting to auth service...`)
    //       window.location.href = `http://localhost:6800?t=${Date.now()}`
    //     } else {
    //       console.log(`[${new Date().toISOString()}] [StandardizedHeader] User found after delay, skipping redirect`)
    //     }
    //   }, 2000)
    // } else if (!user && hasTokens) {
    //   console.log(`[${timestamp}] [StandardizedHeader] No user but tokens present, waiting for session restoration...`)
    // } else if (user) {
    //   console.log(`[${timestamp}] [StandardizedHeader] User authenticated, no redirect needed`)
    // }
  }, [user, searchParams])

  useEffect(() => {
    if (user) {
      setProfileLoaded(false)
    }
  }, [user?.id])

  // Helper function to capitalize names properly
  const capitalizeName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const userId = user?.id ?? "guest"
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const rawDisplayName = userName || fullName || user?.email || userId || "Guest"
  const displayName = capitalizeName(rawDisplayName)
  const initials = displayName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = userAvatar || user?.avatarUrl || null
  
  const roleDisplayName = userRole || user?.role || 'Platform Admin'

  console.log('[StandardizedHeader] Computed values:', {
    userId,
    userName,
    rawDisplayName,
    displayName,
    initials,
    avatarUrl,
    roleDisplayName
  })

  // Fetch complete user profile from database
  useEffect(() => {
    async function fetchUserProfile() {
      console.log('[StandardizedHeader] ===== STARTING PROFILE FETCH =====')
      console.log('[StandardizedHeader] useEffect triggered, user:', user)
      console.log('[StandardizedHeader] user?.id:', user?.id)
      console.log('[StandardizedHeader] user?.email:', user?.email)
      console.log('[StandardizedHeader] profileLoaded:', profileLoaded)

      if (!user?.id || profileLoaded) {
        console.log('[StandardizedHeader] ===== SKIPPING PROFILE FETCH =====')
        console.log('[StandardizedHeader] Reason:', !user?.id ? 'no user id' : 'already loaded')
        return
      }

      console.log('[StandardizedHeader] ===== FETCHING PROFILE =====')
      try {
        console.log('[profile] Fetching user profile for user_id:', user.id)
        setProfileLoaded(true)

        const supabase = createClient()
        console.log('[profile] Created supabase client')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile, error: profileError } = await (supabase as any)
          .schema('public')
          .from('profiles')
          .select('first_name, last_name, user_platform_id')
          .eq('user_id', user.id)
          .single()

        console.log('[profile] ===== QUERY RESULTS =====')
        console.log('[profile] Profile data:', profile)
        console.log('[profile] Profile error:', profileError)

        if (profileError) {
          console.error('[profile] ===== PROFILE QUERY ERROR =====')
          console.error('Error fetching user profile:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          })
          setProfileLoaded(false) // Allow retry
          return
        }

        if (profile) {
          console.log('[profile] ===== PROFILE FOUND =====')
          console.log('[profile] Raw profile:', profile)
          
          // Combine first_name + last_name
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          console.log('[profile] Computed fullName:', fullName)
          
          if (fullName) {
            setUserName(fullName)
            console.log('[profile] Display name set to:', fullName)
          } else {
            console.log('[profile] No name found in profile')
          }

          // Fetch user's actual role
          if (profile.user_platform_id) {
            console.log('[profile] ===== FETCHING ROLE =====')
            console.log('[profile] user_platform_id:', profile.user_platform_id)
            const userPlatformId = profile.user_platform_id
            
            // Get role assignments
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: roleAssignments, error: roleError } = await (supabase as any)
              .schema('public')
              .from('user_to_role_assignment')
              .select('platform_role_id')
              .eq('user_platform_id', userPlatformId)

            console.log('[profile] Role assignments query result:', { roleAssignments, roleError })

            if (roleError || !roleAssignments || roleAssignments.length === 0) {
              console.log('[profile] No role assignments found, using default')
              return
            }

            // Get role details
            const roleIds = roleAssignments.map((r: { platform_role_id: number }) => r.platform_role_id)
            console.log('[profile] Role IDs:', roleIds)
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: roles, error: rolesError } = await (supabase as any)
              .schema('public')
              .from('platform_roles')
              .select('role_name, display_name, privilege_level')
              .in('id', roleIds)
              .order('privilege_level', { ascending: true })

            console.log('[profile] Roles query result:', { roles, rolesError })

            if (rolesError || !roles || roles.length === 0) {
              console.log('[profile] Could not fetch role details, using default')
              return
            }

            // Use the role with highest privilege (lowest number)
            const primaryRole = roles[0]
            const roleDisplay = primaryRole.display_name || primaryRole.role_name
            setUserRole(roleDisplay)
            console.log('[profile] ===== PLATFORM ROLE SET =====')
            console.log('[profile] Role set to:', roleDisplay, 'from role:', primaryRole)

            // Step 6: Check hospital-specific role assignments for additional context
            console.log('[profile] ===== CHECKING HOSPITAL ROLE ASSIGNMENTS =====')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: hospitalAssignments, error: hospitalError } = await (supabase as any)
              .schema('public')
              .from('employee_to_hospital_role_assignment')
              .select('hospital_id, role_id, assignment_status, hospital_name')
              .eq('user_platform_id', userPlatformId)
              .eq('assignment_status', 'active')

            console.log('[profile] Hospital assignments:', hospitalAssignments)
            console.log('[profile] Hospital assignments error:', hospitalError)

            if (hospitalAssignments && hospitalAssignments.length > 0) {
              console.log('[profile] ===== HOSPITAL ASSIGNMENTS FOUND =====')
              console.log('[profile] User has', hospitalAssignments.length, 'active hospital assignments')
              // Could store hospital assignments for later use in component state if needed
            } else {
              console.log('[profile] ===== NO HOSPITAL ASSIGNMENTS =====')
            }

            console.log('[profile] ===== COMPLETE PRIVILEGE VALIDATION CHAIN =====')
            console.log('[profile] 1. auth.id →', user.id)
            console.log('[profile] 2. profiles.user_id → profile found')
            console.log('[profile] 3. profiles.user_platform_id →', userPlatformId)
            console.log('[profile] 4. user_to_role_assignment.platform_role_id →', roleIds)
            console.log('[profile] 5. platform_roles.id →', primaryRole.role_name)
            console.log('[profile] 6. employee_to_hospital_role_assignment.user_platform_id →', hospitalAssignments?.length || 0, 'assignments')
          } else {
            console.log('[profile] No user_platform_id found')
          }
        } else {
          console.log('[profile] ===== NO PROFILE FOUND IN DATABASE =====')
          console.log('[profile] User ID searched:', user.id)
          console.log('[profile] Auth user data:', {
            id: user?.id,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            role: user?.role
          })
          setProfileLoaded(true)
        }
      } catch (error) {
        console.error('[profile] ===== EXCEPTION =====')
        console.error('Exception fetching user profile:', error)
        setProfileLoaded(false) // Allow retry on error
      }
      console.log('[StandardizedHeader] ===== PROFILE FETCH COMPLETE =====')
    }

    fetchUserProfile()
  }, [user?.id, profileLoaded])

  async function handleSignOut() {
    try {
      console.log('[StandardizedHeader] handleSignOut clicked')
      
      // Call the logout function from AuthContext
      console.log('[StandardizedHeader] Calling logout()')
      logout()
      console.log('[StandardizedHeader] logout() completed')

      // Clear all local storage and session storage
      console.log('[StandardizedHeader] Clearing storage')
      localStorage.clear()
      sessionStorage.clear()
      
      // Also clear cookies by setting them to expire
      try {
        console.log('[StandardizedHeader] Clearing cookies')
        document.cookie.split(';').forEach((c: string) => {
          const cookieName = c.split('=')[0].trim()
          if (cookieName) {
            const expireDate = new Date('Thu, 01 Jan 1970 00:00:00 GMT').toUTCString()
            document.cookie = cookieName + '=;expires=' + expireDate + ';path=/'
          }
        })
        console.log('[StandardizedHeader] Cookies cleared')
      } catch (e) {
        console.error('[StandardizedHeader] Error clearing cookies:', e)
        // Cookie clearing might fail, but that's ok
      }

      window.dispatchEvent(new Event('storage'))
      console.log('[StandardizedHeader] Storage event dispatched')

      // Redirect to auth service login page and stay there
      console.log('[StandardizedHeader] Redirecting to auth service')
      window.location.href = 'http://localhost:6800'
    } catch (error) {
      console.error('[StandardizedHeader] Error signing out:', error)
      // Force redirect even if there's an error
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = 'http://localhost:6800'
    }
  }

  function handleAvatarClick() {
    if (uploading) {
      return
    }

    setMenuError(null)
    fileInputRef.current?.click()
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) {
      event.target.value = ''
      return
    }

    setUploading(true)
    setMenuError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop() ?? 'png'
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('profile-icons').upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage.from('profile-icons').getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      // Update auth metadata only (avatar stored in user_metadata)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        throw updateError
      }

  console.log('[profile] Avatar uploaded and updated:', publicUrl)

      setMenuError(null)
    } catch (error) {
      console.error('Upload failed:', error)
      setMenuError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <header className="relative z-10 w-full bg-white/90 shadow-sm backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-200/40 via-white to-amber-200/40" aria-hidden="true" />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={homeRoute} className="flex items-center gap-3 text-lg font-semibold text-slate-800">
          <FurfieldLogo className="rounded-full" size={52} />
          <span className="hidden sm:inline tracking-wide">{title}</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <Link 
                href={homeRoute}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Home
              </Link>
              <div className="relative flex flex-col items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/80 text-sm font-semibold text-slate-600 shadow transition hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label={uploading ? 'Uploading profile image' : 'Upload profile image'}
                  disabled={uploading}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Profile avatar"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-emerald-500 text-base font-semibold text-white shadow-inner">
                      {initials}
                    </div>
                  )}
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      ...
                    </div>
                  ) : null}
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="hidden text-sm text-slate-600 sm:flex sm:flex-col">
                    <span className="font-medium text-slate-700">
                      {displayName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {roleDisplayName}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 sm:hidden">
                    {displayName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = encodeURIComponent('http://localhost:3000')
                    window.location.href = `http://localhost:6800?redirect=${target}`
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  title="Go to Organization Portal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>

              {menuError ? (
                <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500 shadow-sm">
                  {menuError}
                </p>
              ) : null}
            </div>
            </>
          ) : (
            // Placeholder content for unauthenticated users (guest state)
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 text-base font-semibold text-white shadow-inner">
                {initials}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5">
                <div className="hidden text-sm text-slate-600 sm:flex sm:flex-col">
                  <span className="font-medium text-slate-700">
                    {displayName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {roleDisplayName}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 sm:hidden">
                  {displayName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}