import ProductView from '@/app/components/product/ProductView'

// Mock product data - in a real app, this would come from your commerce API
const mockProduct = {
  id: 'hoodie-001',
  name: 'VFR Sport Hoodie',
  sku: 'hoodie-001',
  price: 79.99,
  description: 'Experience our premium sport hoodie with advanced moisture-wicking technology and ergonomic design. Perfect for both training and casual wear.',
  images: [
    '/demo-clothing/hoodie.svg',
    '/demo-clothing/hoodie.svg',
    '/demo-clothing/hoodie.svg',
    '/demo-clothing/hoodie.svg'
  ],
  colors: [
    { name: 'Cegeka Blue', hex: '#0066cc' },
    { name: 'Sport Red', hex: '#dc2626' },
    { name: 'Fashion Black', hex: '#000000' },
    { name: 'Fresh Green', hex: '#16a34a' }
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">VFR Commerce Demo</h1>
            <div className="flex gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                3D Demo
              </a>
              <a href="/google-vs-vfr" className="text-gray-600 hover:text-gray-900">
                2D vs 3D
              </a>
              <a href="/shop" className="text-blue-600 font-medium">
                Shop
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Product */}
      <ProductView product={mockProduct} />

      {/* Comparison section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          Why VFR-Anna Beats Traditional E-commerce
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-600">
              Traditional 2D (Google Try-On)
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>Single front view only (1024px)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>No size accuracy or physics simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>Only available via Google Shopping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>USA-only beta program</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>5-10 seconds processing time</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">
              VFR-Anna 3D in Your Store
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Full 360° real-time 3D view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>±2cm size accuracy with physics simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Platform-agnostic, works in any store</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>EU-ready, globally deployed via Vercel Edge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Instant rendering (60 FPS)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            See the difference yourself - toggle between 2D and 3D views above!
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/cegeka-demo.html"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View Full Demo
            </a>
            <a
              href="/google-vs-vfr"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Compare Technologies
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}