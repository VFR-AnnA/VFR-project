'use client'

import { useState } from 'react'
import Image from 'next/image'
import VFRViewer from '@/app/components/vfr/VFRViewer'
import TryOnButton from '@/app/components/TryOnButton'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  description: string
  images: string[]
  colors: Array<{ name: string; hex: string }>
  sizes: string[]
}

interface ProductViewProps {
  product: Product
}

export default function ProductView({ product }: ProductViewProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [showVFR, setShowVFR] = useState(true)

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto p-4">
      {/* Left side - Product visuals */}
      <div className="relative">
        {/* Toggle between 2D and 3D view */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-1">
          <button
            onClick={() => setShowVFR(true)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              showVFR ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setShowVFR(false)}
            className={`px-3 py-1 text-sm font-medium rounded ml-1 ${
              !showVFR ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            2D Gallery
          </button>
        </div>

        {showVFR ? (
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <VFRViewer sku={product.sku} color={selectedColor.hex} />
          </div>
        ) : (
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-2 p-2 h-full">
              {product.images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Product details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            €{product.price.toFixed(2)}
          </p>
        </div>

        <p className="text-gray-600">{product.description}</p>

        {/* Color selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={`relative w-10 h-10 rounded-full border-2 ${
                  selectedColor.name === color.name
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor.name === color.name && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">{selectedColor.name}</p>
        </div>

        {/* Size selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-2 px-4 text-sm font-medium rounded-md border ${
                  selectedSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Size recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">
            Recommended Size: {selectedSize}
          </h4>
          <p className="text-sm text-blue-700">
            Based on your measurements and this product's fit
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Add to Cart - Size {selectedSize}
          </button>
          <TryOnButton sku={product.sku} />
        </div>

        {/* Features */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              360° 3D view with real-time rendering
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Accurate size recommendations
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Physics-based fabric simulation
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}