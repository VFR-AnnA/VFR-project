/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:46+02:00
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAIAssistant } from "../../contexts/AIAssistantContext";

export interface VariantItem {
  id: string;
  imageUrl?: string;
  modelUrl?: string;
  title: string;
  description?: string;
}

interface VariantGalleryProps {
  items: VariantItem[];
  onSelect?: (item: VariantItem) => void;
  className?: string;
}

export default function VariantGallery({
  items,
  onSelect,
  className = "",
}: VariantGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { settings } = useAIAssistant();
  
  // Filter items based on personalization settings
  const displayItems = settings.personalizedRecommendations
    ? items
    : items.slice(0, Math.min(2, items.length)); // Show fewer variants if personalization is off

  // Handle selection of a variant
  const handleSelect = (item: VariantItem, index: number) => {
    setActiveIndex(index);
    if (onSelect) {
      onSelect(item);
    }
  };

  // Mouse and touch event handlers for smooth scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - galleryRef.current.offsetLeft);
    setScrollLeft(galleryRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    galleryRef.current.scrollLeft = scrollLeft - walk;
  };

  // Add event listeners for mouse up outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // If no items, don't render anything
  if (!items.length) return null;
  
  // If personalized recommendations are disabled, show a message
  const showPersonalizationHint = !settings.personalizedRecommendations && items.length > 2;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          AI-Generated Variants
          {settings.engine !== "openai" && (
            <span className="ml-2 text-xs text-indigo-600">
              via {settings.engine === "gemini" ? "Gemini" :
                   settings.engine === "mistral" ? "Mistral" :
                   settings.engine === "custom" ? "Custom AI" : "AI"}
            </span>
          )}
        </h3>
        <p className="text-xs text-gray-500">
          Select a variant to try a different style
          {showPersonalizationHint && (
            <span className="block mt-1 text-indigo-600">
              <button
                className="underline focus:outline-none"
                onClick={() => window.location.href = "/settings/ai"}
              >
                Enable personalized recommendations
              </button> to see more variants
            </span>
          )}
        </p>
      </div>

      {/* Gallery container with horizontal scrolling */}
      <div
        ref={galleryRef}
        className="flex overflow-x-auto pb-4 hide-scrollbar"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex space-x-4 px-1">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex-shrink-0 w-40 cursor-pointer rounded-lg overflow-hidden ${
                activeIndex === index
                  ? "ring-2 ring-indigo-500"
                  : "ring-1 ring-gray-200"
              }`}
              onClick={() => handleSelect(item, index)}
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Selection indicator */}
                {activeIndex === index && (
                  <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-2">
                <h4 className="text-xs font-medium truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom pagination dots */}
      {items.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                activeIndex === index ? "bg-indigo-500" : "bg-gray-300"
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to variant ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Add custom scrollbar styling */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}