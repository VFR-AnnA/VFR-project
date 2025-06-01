'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  const linkStyle = (path: string) => {
    const base = "rounded px-3 py-1 text-sm font-medium transition hover:bg-blue-50";
    return pathname === path 
      ? `${base} bg-blue-600 text-white` 
      : `${base} text-gray-600 hover:text-gray-900`;
  };

  return (
    <nav className="fixed left-0 top-0 z-40 w-full bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">VFR-Anna</h1>
            <div className="flex gap-2">
              <Link href="/" className={linkStyle("/")}>
                3D Demo
              </Link>
              <Link href="/google-vs-vfr" className={linkStyle("/google-vs-vfr")}>
                2D vs 3D
              </Link>
              <Link href="/shop" className={linkStyle("/shop")}>
                Shop Demo
              </Link>
              <a 
                href="/cegeka-demo.html" 
                className="rounded px-3 py-1 text-sm font-medium transition hover:bg-blue-50 text-gray-600 hover:text-gray-900"
              >
                Cegeka Demo
              </a>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Vercel Commerce Integration
          </div>
        </div>
      </div>
    </nav>
  );
}