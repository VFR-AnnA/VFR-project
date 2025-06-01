'use client'

import { useState } from 'react'
import Image from 'next/image'
import GoogleTryOn from '../components/GoogleTryOn'
import SimpleVFRViewer from '../components/SimpleVFRViewer'

export default function GoogleVsVfrPage() {
  const [activeTab, setActiveTab] = useState<'google' | 'vfr'>('google')

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            2D vs 3D Virtual Try-On Comparison
          </h1>
          <p className="mt-2 text-gray-600">
            Compare Google's 2D overlay technology with VFR-Anna's real-time 3D solution
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'google'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Google 2D Try-On
          </button>
          <button
            onClick={() => setActiveTab('vfr')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'vfr'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            VFR-Anna 3D
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'google' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Google Virtual Try-On</h2>
              <GoogleTryOn />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">VFR-Anna 3D Try-On</h2>
              <SimpleVFRViewer />
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Google 2D</th>
                  <th className="text-center py-3 px-4">VFR-Anna 3D</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">View Angles</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">Single front view</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">Full 360° rotation</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Processing Time</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">5-10 seconds</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">Instant (60 FPS)</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Size Accuracy</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">No sizing</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">±2cm precision</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Physics Simulation</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">None</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">Real-time physics</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Platform</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-600">Google Shopping only</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">Any website</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Availability</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">USA beta only</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600">Global</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}