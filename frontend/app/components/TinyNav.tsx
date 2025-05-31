"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TinyNav() {
  const pathname = usePathname();
  const linkStyle =
    "rounded px-3 py-1 text-sm font-medium transition hover:bg-blue-50";

  return (
    <nav className="fixed left-0 top-0 z-40 flex gap-2 bg-white/80 p-2 shadow-sm backdrop-blur">
      <Link 
        href="/" 
        className={`${linkStyle} ${pathname === "/" ? "bg-blue-600 text-white" : ""}`}
      >
        3-D Demo
      </Link>
      <Link 
        href="/google-vs-vfr" 
        className={`${linkStyle} ${pathname === "/google-vs-vfr" ? "bg-blue-600 text-white" : ""}`}
      >
        2-D vs 3-D
      </Link>
    </nav>
  );
}