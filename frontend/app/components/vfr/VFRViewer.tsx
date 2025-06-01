'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazily load the 3D viewer to avoid SSR issues with Three.js
const VFRDemoStage = dynamic(() => import('./VFRDemoStage'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D viewer...</p>
      </div>
    </div>
  )
})

interface VFRViewerProps {
  sku: string
  color?: string
  className?: string
}

export default function VFRViewer({ sku, color = '#0066cc', className = '' }: VFRViewerProps) {
  return (
    <div className={`relative w-full h-full min-h-[500px] ${className}`}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-gray-50">
          <p className="text-gray-600">Initializing 3D experience...</p>
        </div>
      }>
        <VFRDemoStage sku={sku} initColor={color} />
      </Suspense>
    </div>
  )
}