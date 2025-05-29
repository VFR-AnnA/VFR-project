/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:45+02:00
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../contexts/AIAssistantContext";

interface FabProps {
  className?: string;
}

export default function Fab({ className = "" }: FabProps) {
  // Use regular state instead of useState for debugging
  const [state, setState] = useState({
    isOpen: false,
    hasInteracted: false
  });
  
  const { settings } = useAIAssistant();

  // Log initial state
  useEffect(() => {
    console.log("Fab component mounted, initial state:", state);
    
    // Add a global window function for debugging
    if (typeof window !== 'undefined') {
      (window as any).toggleFabState = () => {
        setState(prev => {
          const newState = {
            ...prev,
            isOpen: !prev.isOpen,
            hasInteracted: true
          };
          console.log("State manually toggled to:", newState);
          return newState;
        });
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).toggleFabState;
      }
    };
  }, []);

  // Click handler for the FAB button
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    console.log("Button clicked at", new Date().toISOString());
    
    setState(prev => {
      const newState = {
        ...prev,
        isOpen: !prev.isOpen,
        hasInteracted: true
      };
      console.log("Setting state to:", newState);
      return newState;
    });
  }

  // Handle asking the AI assistant
  const handleAsk = async (input: string) => {
    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input, engine: settings.engine }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const { text } = await res.json();
      console.log('AI response:', text);
      // Here you would handle the AI response, e.g., display it to the user
      return text;
    } catch (error) {
      console.error('Error asking AI:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  };

  // Close the FAB when clicking outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".ai-fab-container")) {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [state.isOpen]);

  // Prevent layout shift by using fixed positioning
  return (
    <div
      className={`ai-fab-container ${className}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: "56px",
        height: "56px",
        pointerEvents: 'auto'
      }}
    >
      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px',
            fontSize: '12px',
            zIndex: 10000
          }}>
            FAB State: {state.isOpen ? 'Open' : 'Closed'}
          </div>
          
          <button
            onClick={() => (window as any).toggleFabState?.()}
            style={{
              position: 'fixed',
              top: '40px',
              right: '10px',
              background: 'blue',
              color: 'white',
              border: 'none',
              padding: '5px',
              borderRadius: '4px',
              zIndex: 10000
            }}
          >
            Toggle FAB (Debug)
          </button>
        </>
      )}
      
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            id="ai-assistant-menu"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 w-64"
            style={{ transformOrigin: "bottom right" }}
            role="dialog"
            aria-label="AI Assistant Menu"
          >
            <div className="text-sm font-medium mb-2">
              {settings.engine === "openai" ? "Anna" :
               settings.engine === "gemini" ? "Gemini Assistant" :
               settings.engine === "mistral" ? "Mistral Assistant" :
               "Custom AI Assistant"}
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Ask me about sizes, styles, or outfit recommendations
            </p>
            {settings.showSuggestions && (
              <div className="flex flex-col gap-2">
                <button
                  className="text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
                  onClick={() => {
                    handleAsk("What size should I choose?");
                    setState(prev => ({ ...prev, isOpen: false }));
                  }}
                  aria-label="Ask about size recommendation"
                >
                  What size should I choose?
                </button>
                <button
                  className="text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
                  onClick={() => {
                    handleAsk("Suggest similar styles");
                    setState(prev => ({ ...prev, isOpen: false }));
                  }}
                  aria-label="Ask for style suggestions"
                >
                  Suggest similar styles
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
          backgroundColor: state.isOpen ? '#4f46e5' : '#ef4444',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
        aria-label="Open AI Assistant"
        data-expanded={state.isOpen}
        data-controls="ai-assistant-menu"
      >
        {state.isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
        )}
      </button>

      {/* Pulse animation for new users who haven't interacted yet */}
      {!state.hasInteracted && (
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: '#818cf8',
          opacity: 0.75,
          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
        }}></span>
      )}
      
      {/* Add keyframes for ping animation */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}