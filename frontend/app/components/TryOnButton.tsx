"use client";

import { useState } from "react";

interface TryOnButtonProps {
  sku: string;
  className?: string;
}

export default function TryOnButton({ sku, className = "" }: TryOnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`mt-4 w-full rounded bg-indigo-600 py-3 px-4 text-white font-medium hover:bg-indigo-700 transition-colors ${className}`}
      >
        Try On in 3D
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-semibold">3D Virtual Try-On</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="relative h-[80vh]">
                <iframe
                  src={`/cegeka-demo.html?sku=${encodeURIComponent(sku)}`}
                  className="h-full w-full"
                  allow="camera"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}