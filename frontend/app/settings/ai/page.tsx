/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:49+02:00
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAIAssistant, AIEngine } from "../../contexts/AIAssistantContext";

export default function AISettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, isLoading } = useAIAssistant();
  const [engine, setEngine] = useState<AIEngine>("openai");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Load settings when component mounts
  useEffect(() => {
    if (!isLoading) {
      setEngine(settings.engine);
      setCustomEndpoint(settings.customEndpoint || "");
    }
  }, [settings, isLoading]);

  // Mock user object - in a real app, this would come from your auth system
  const user = {
    isPro: true,
    name: "Test User"
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update settings in context
    updateSettings({
      engine,
      ...(engine === "custom" && {
        customEndpoint,
      })
    });
    
    // In a real app, you would also save the API key securely to your backend
    if (engine === "custom" && customApiKey) {
      console.log("API key would be securely saved to backend");
      // Don't store API keys in localStorage for security reasons
    }
    
    setIsSaving(false);
    
    // Show success message or redirect
    router.push("/");
  };

  const handleTest = async () => {
    if (engine !== "custom" || !customEndpoint || !customApiKey) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API call to test connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would test the connection to the custom endpoint
    const success = customEndpoint.includes("api") && customApiKey.length > 10;
    
    setTestResult({
      success,
      message: success 
        ? "Connection successful! Your API key and endpoint are working." 
        : "Connection failed. Please check your API key and endpoint."
    });
    
    setIsTesting(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your AI assistant preferences and API connections
            </p>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div>
              <label htmlFor="ai-engine" className="block text-sm font-medium text-gray-700 mb-1">
                AI Engine
              </label>
              <select
                id="ai-engine"
                value={engine}
                onChange={(e) => setEngine(e.target.value as AIEngine)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label="Select AI engine"
              >
                <option value="openai">Anna (GPT-4o – fast)</option>
                <option value="gemini">Google Gemini Ultra</option>
                <option value="mistral">Mistral Large</option>
                {user.isPro && <option value="custom">Custom API Key</option>}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select which AI model powers your assistant
              </p>
            </div>
            
            {engine === "custom" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <label htmlFor="endpoint-url" className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    id="endpoint-url"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Enter custom endpoint URL"
                  />
                </div>
                
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="api-key"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Enter custom API key"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your API key is stored securely and never shared
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting || !customEndpoint || !customApiKey}
                  className={`mt-2 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isTesting || !customEndpoint || !customApiKey
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>
                
                {testResult && (
                  <div className={`mt-2 p-3 rounded-md ${
                    testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Settings</h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="auto-suggestions"
                    type="checkbox"
                    checked={settings.showSuggestions}
                    onChange={(e) => updateSettings({ showSuggestions: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-suggestions" className="ml-2 block text-sm text-gray-700">
                    Show AI suggestions automatically
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="save-history"
                    type="checkbox"
                    checked={settings.saveHistory}
                    onChange={(e) => updateSettings({ saveHistory: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save-history" className="ml-2 block text-sm text-gray-700">
                    Save conversation history
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="personalized"
                    type="checkbox"
                    checked={settings.personalizedRecommendations}
                    onChange={(e) => updateSettings({ personalizedRecommendations: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="personalized" className="ml-2 block text-sm text-gray-700">
                    Enable personalized recommendations
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}