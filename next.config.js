/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xnetjsifkhtbbpadwlxy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Enable static exports for deployment flexibility
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Optimize for admin dashboard
  poweredByHeader: false,
  compress: true,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      // Removed /login to /auth redirect since we have /login page
    ]
  },
}

export default nextConfig