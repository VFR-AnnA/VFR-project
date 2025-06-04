'use client'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import products from '../../data/products.json'
import TryOnButton from '../../components/TryOnButton'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find(p => p.slug === params.slug)
  if (!product) return notFound()

  const [fitOk, setFitOk] = useState(false)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{product.title}</h1>
      <p>{product.description}</p>
      <TryOnButton sku={product.sku} onFit={() => setFitOk(true)} />
      <button className="bg-blue-500 text-white px-4 py-2" disabled={!fitOk}>
        Add to Cart
      </button>
    </div>
  )
}
