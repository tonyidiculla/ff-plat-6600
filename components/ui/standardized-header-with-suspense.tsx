'use client'

import { Suspense } from 'react'
import { StandardizedHeader } from '@/components/ui/standardized-header'
import type { StandardizedHeaderProps } from '@/components/ui/standardized-header'

export function StandardizedHeaderWithSuspense(props: StandardizedHeaderProps) {
  return (
    <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
      <StandardizedHeader {...props} />
    </Suspense>
  )
}