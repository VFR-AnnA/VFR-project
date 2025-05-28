/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:48+02:00
 */

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import Link from "next/link";
import VFRViewerWrapper from "./VFRViewerWrapper";
import { ErrorBoundary } from 'react-error-boundary';
import VariantGallery, { VariantItem } from "./ai-assist/VariantGallery";
import { useAIAssistant } from "../contexts/AIAssistantContext";

// Mock data for AI-generated variants
const mockVariants: VariantItem[] = [
  {
    id: "variant-1",
    imageUrl: "https://placehold.co/300x400/e2e8f0/1e293b?text=Original",
    title: "Original",
    description: "Your current selection"
  },
  {
    id: "variant-2",
    imageUrl: "https://placehold.co/300x400/e2e8f0/1e293b?text=Elegant",
    title: "Elegant Style",
    description: "More formal look"
  },
  {
    id: "variant-3",
    imageUrl: "https://placehold.co/300x400/e2e8f0/1e293b?text=Casual",
    title: "Casual Style",
    description: "Relaxed everyday look"
  },
  {
    id: "variant-4",
    imageUrl: "https://placehold.co/300x400/e2e8f0/1e293b?text=Sporty",
    title: "Sporty Style",
    description: "Athletic inspired"
  }
];

interface TryOnModalProps {
  productName?: string;
  productImage?: string;
  initialVariants?: VariantItem[];
}

export default function TryOnModal({
  productName = "Classic Fit Shirt",
  productImage,
  initialVariants = mockVariants
}: TryOnModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [variants, setVariants] = useState<VariantItem[]>(initialVariants);
  const [selectedVariant, setSelectedVariant] = useState<VariantItem>(variants[0]);
  const [size, setSize] = useState("M");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { settings } = useAIAssistant();

  const handleViewerFail = useCallback(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Viewer failed to load');
    }
    setIsOpen(false);
  }, []);

  const handleVariantSelect = useCallback((variant: VariantItem) => {
    setSelectedVariant(variant);
    console.log(`Selected variant: ${variant.title}`);
  }, []);

  const handleAddToCart = useCallback(() => {
    setIsAddingToCart(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(`Added to cart: ${productName} (${size}) - Variant: ${selectedVariant.title}`);
      setIsAddingToCart(false);
      setIsOpen(false);
    }, 1000);
  }, [productName, size, selectedVariant]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button 
          className="focus:outline-none focus-visible:ring-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors" 
          role="button" 
          aria-label="Try it on"
        >
          Try It On
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        {/* Use a separate motion div for the overlay animation */}
        <motion.div
          className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
          >
            <Dialog.Title className="text-xl font-semibold mb-4">
              {productName}
            </Dialog.Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: 3D viewer */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "500px" }}>
                <ErrorBoundary fallbackRender={() => {
                  handleViewerFail();
                  return (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <p className="text-gray-600">Failed to load 3D viewer</p>
                    </div>
                  );
                }}>
                  <VFRViewerWrapper />
                </ErrorBoundary>
              </div>
              
              {/* Right column: Product details and variants */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Size Selection</h3>
                  <div className="flex space-x-2">
                    {["XS", "S", "M", "L", "XL"].map((sizeOption) => (
                      <button
                        key={sizeOption}
                        className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          size === sizeOption
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setSize(sizeOption)}
                        aria-label={`Select size ${sizeOption}`}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* AI-generated variants */}
                {variants.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">AI-Generated Variants</h3>
                      <Link
                        href="/settings/ai"
                        className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        AI Settings
                      </Link>
                    </div>
                    <VariantGallery
                      items={variants}
                      onSelect={handleVariantSelect}
                      className="mb-6"
                    />
                  </div>
                )}
                
                {/* Add to cart button */}
                <div className="mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isAddingToCart
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isAddingToCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : (
                      `Add to Cart - Size ${size}`
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Free shipping and returns on all orders
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}