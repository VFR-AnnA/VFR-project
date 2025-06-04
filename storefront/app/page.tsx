import Link from 'next/link'
import products from '../data/products.json'

export default function Home() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.slug}>
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
