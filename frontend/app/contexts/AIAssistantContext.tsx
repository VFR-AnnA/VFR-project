/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:49+02:00
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the types for our context
export type AIEngine = "openai" | "gemini" | "mistral" | "custom";

interface AISettings {
  engine: AIEngine;
  customEndpoint?: string;
  showSuggestions: boolean;
  saveHistory: boolean;
  personalizedRecommendations: boolean;
}

interface AIAssistantContextType {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
  isLoading: boolean;
}

// Create the context with a default value
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Default settings
const defaultSettings: AISettings = {
  engine: "openai",
  showSuggestions: true,
  saveHistory: true,
  personalizedRecommendations: true
};

// Provider component
export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("ai-assistant-settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Error loading AI assistant settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to ensure this runs after hydration
    // This prevents hydration mismatch errors
    const timer = setTimeout(() => {
      loadSettings();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;

    try {
      localStorage.setItem("ai-assistant-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving AI assistant settings:", error);
    }
  }, [settings, isLoading]);

  // Function to update settings
  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Provide the context value to children
  return (
    <AIAssistantContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

// Custom hook for using the context
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
}