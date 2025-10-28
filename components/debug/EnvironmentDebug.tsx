'use client'

import { useEffect, useState } from 'react'

export default function EnvironmentDebug() {
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({})

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Status Checks</h2>
        <div className="space-y-2">
          <div className={`p-2 rounded ${envVars.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-100' : 'bg-red-100'}`}>
            Supabase URL: {envVars.NEXT_PUBLIC_SUPABASE_URL ? '[OK] Set' : '[ERROR] Missing'}
          </div>
          <div className={`p-2 rounded ${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-100' : 'bg-red-100'}`}>
            Supabase Anon Key: {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[OK] Set' : '[ERROR] Missing'}
          </div>
        </div>
      </div>
    </div>
  )
}