/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:46+02:00
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../contexts/AIAssistantContext";

interface PromptBarProps {
  context?: "body-tweak" | "size-advice" | "style-suggestion";
  className?: string;
}

export default function PromptBar({
  context = "body-tweak",
  className = ""
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useAIAssistant();

  // Get context-specific suggestions
  const getSuggestions = useCallback(() => {
    switch (context) {
      case "body-tweak":
        return [
          "More defined waistline",
          "Elegant pants style",
          "Broader shoulders",
          "Slimmer silhouette"
        ];
      case "size-advice":
        return [
          "What size fits me best?",
          "Is this too tight around shoulders?",
          "Show me a better fit for my body type",
          "Should I size up or down?"
        ];
      case "style-suggestion":
        return [
          "Realistic leather texture",
          "Vintage denim look",
          "More elegant version",
          "Casual alternative"
        ];
      default:
        return [
          "How does this look?",
          "Suggest improvements",
          "Show alternatives",
          "Create a similar style"
        ];
    }
  }, [context]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // Set loading state
    setIsLoading(true);
    console.log(`Processing AI prompt: ${prompt} (context: ${context})`);
    
    try {
      // Call the API endpoint
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `[Context: ${context}] ${prompt}`,
          engine: settings.engine
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const { text } = await res.json();
      console.log('AI response:', text);
      
      // If history saving is enabled, save this interaction
      if (settings.saveHistory) {
        try {
          const historyItem = {
            timestamp: new Date().toISOString(),
            prompt,
            response: text,
            context,
            engine: settings.engine
          };
          
          // Get existing history or initialize empty array
          const existingHistory = JSON.parse(localStorage.getItem('ai-assistant-history') || '[]');
          existingHistory.push(historyItem);
          
          // Save back to localStorage (limit to last 20 items)
          localStorage.setItem(
            'ai-assistant-history',
            JSON.stringify(existingHistory.slice(-20))
          );
        } catch (error) {
          console.error('Error saving to history:', error);
        }
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  }, [prompt, context, settings]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setPrompt(suggestion);
    // Focus the input after selecting a suggestion
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  return (
    <div className={`w-full h-32 ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        role="search"
        aria-label="AI Assistant prompt input"
      >
        <div className="flex items-center px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask the AI assistant... ${
              context === "body-tweak" ? "e.g., 'More waist definition'" :
              context === "size-advice" ? "e.g., 'Is this my size?'" :
              context === "style-suggestion" ? "e.g., 'More elegant look'" :
              "e.g., 'How does this look?'"
            }`}
            className="flex-1 border-0 bg-transparent focus:ring-0 text-sm"
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 100)}
            disabled={isLoading}
            aria-label="Ask the AI assistant"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`ml-2 p-1.5 rounded-full ${
              !prompt.trim() || isLoading
                ? "text-gray-400 bg-gray-100"
                : "text-white bg-indigo-600 hover:bg-indigo-700"
            } transition-colors`}
            aria-label="Send prompt"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && settings.showSuggestions && (
            <motion.div
              id="ai-suggestions"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-3"
              role="listbox"
              aria-label="Suggested prompts"
            >
              <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
              <div className="flex flex-wrap gap-2" role="group">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}