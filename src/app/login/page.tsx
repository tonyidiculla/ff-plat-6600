"use client"

import { useEffect } from "react"

export default function LoginPage() {
    // Redirect to centralized auth service for SSO login
    useEffect(() => {
    console.log('[auth] Redirecting to centralized auth service...')
        window.location.href = 'http://localhost:6800'
    }, [])

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-sky-100 px-4 py-16 text-slate-700">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,182,193,0.3),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(135,206,250,0.3),_transparent_50%)]" />

            <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/80 p-10 shadow-2xl backdrop-blur">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Platform Admin</h1>
                    <p className="text-sm text-slate-500">
                        Redirecting to unified login portal...
                    </p>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}