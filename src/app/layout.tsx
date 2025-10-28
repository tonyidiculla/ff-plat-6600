import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Suspense } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'),
  title: 'Platform Admin Portal',
  description: 'Platform Administration Portal for Multi-Tenant Pet Management Ecosystem',
  authors: [{ name: 'Platform Admin Portal' }],
  keywords: ['admin', 'platform', 'pet management', 'multi-tenant'],
  robots: 'noindex, nofollow',
  icons: {
    icon: [
      { url: '/paw-logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Platform Admin Portal',
    title: 'Platform Admin Portal',
    description: 'Platform Administration Portal for Multi-Tenant Pet Management Ecosystem',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
