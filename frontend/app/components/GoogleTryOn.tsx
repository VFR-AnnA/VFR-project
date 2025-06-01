'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function GoogleTryOn() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedClothing, setSelectedClothing] = useState<string>('/demo-clothing/tshirt.svg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clothingOptions = [
    { id: 'tshirt', name: 'T-Shirt', image: '/demo-clothing/tshirt.svg' },
    { id: 'hoodie', name: 'Hoodie', image: '/demo-clothing/hoodie.svg' },
    { id: 'jacket', name: 'Jacket', image: '/demo-clothing/jacket.svg' },
    { id: 'polo', name: 'Polo', image: '/demo-clothing/polo.svg' },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setShowResult(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTryOn = () => {
    if (!uploadedImage) return
    
    setIsProcessing(true)
    // Simulate Google's processing time
    setTimeout(() => {
      setIsProcessing(false)
      setShowResult(true)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        {!uploadedImage ? (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Upload a photo to try on clothes
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Choose Photo
            </button>
          </div>
        ) : (
          <div className="relative">
            <Image
              src={uploadedImage}
              alt="Uploaded photo"
              width={400}
              height={400}
              className="mx-auto rounded-lg"
            />
            {showResult && (
              <Image
                src={selectedClothing}
                alt="Clothing overlay"
                width={200}
                height={200}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"
              />
            )}
          </div>
        )}
      </div>

      {/* Clothing Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3">Select Clothing</h3>
        <div className="grid grid-cols-4 gap-3">
          {clothingOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedClothing(item.image)
                setShowResult(false)
              }}
              className={`p-3 border rounded-lg hover:border-blue-500 transition-colors ${
                selectedClothing === item.image ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="mx-auto"
              />
              <p className="text-sm mt-2">{item.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Try On Button */}
      {uploadedImage && (
        <button
          onClick={handleTryOn}
          disabled={isProcessing}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing... (Google API simulation)
            </span>
          ) : (
            'Try On'
          )}
        </button>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a simulation of Google's 2D try-on technology. 
          In production, this would use Google's Virtual Try-On API (currently in beta for US users only).
        </p>
      </div>
    </div>
  )
}