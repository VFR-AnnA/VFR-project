'use client'
import { Dialog } from '@headlessui/react'
import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function TryOnButton({ sku, onFit }: { sku: string; onFit: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handler(ev: MessageEvent) {
      if (ev.data && ev.data.type === 'vfr-fit' && ev.data.ok) {
        onFit()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <>
      <button
        className="bg-gray-200 px-4 py-2"
        onClick={() => setOpen(true)}
      >
        Try It On First
      </button>
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vfr-widget@0.1.0/dist/widget.umd.js"
        strategy="lazyOnload"
      />
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setOpen(false)} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-4">
            <div id="vfr-slot" data-sku={sku}></div>
            <Script id="vfr-init" strategy="lazyOnload">
              {`VFRWidget.init({ selector:'#vfr-slot', merchantId:'demo-shop' });`}
            </Script>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
