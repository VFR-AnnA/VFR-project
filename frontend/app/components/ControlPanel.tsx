/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:47+02:00
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import AIPromptBar from "./ai-assist/PromptBar";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, AVATAR_PARAM_RANGES } from "../../types/avatar-params";
import { useAIAssistant } from "../contexts/AIAssistantContext";

interface ControlPanelProps {
  avatarParams?: AvatarParams;
  onParamChange?: (param: keyof AvatarParams, value: number) => void;
  className?: string;
}

export default function ControlPanel({
  avatarParams = DEFAULT_AVATAR_PARAMS,
  onParamChange,
  className = "",
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<"body" | "outfit">("body");
  const { settings } = useAIAssistant();

  const handleParamChange = (param: keyof AvatarParams, value: number) => {
    if (onParamChange) {
      onParamChange(param, value);
    }
  };

  return (
    <aside className={`flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm ${className}`}>
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "body"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("body")}
        >
          Body Measurements
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "outfit"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("outfit")}
        >
          Outfit Options
        </button>
      </div>

      {/* Body measurements controls */}
      {activeTab === "body" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height: {avatarParams.heightCm} cm
            </label>
            <input
              type="range"
              min={AVATAR_PARAM_RANGES.heightCm.min}
              max={AVATAR_PARAM_RANGES.heightCm.max}
              value={avatarParams.heightCm}
              onChange={(e) => handleParamChange("heightCm", parseInt(e.target.value))}
              className="w-full"
              aria-label={`Height slider: ${avatarParams.heightCm} cm`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chest: {avatarParams.chestCm} cm
            </label>
            <input
              type="range"
              min={AVATAR_PARAM_RANGES.chestCm.min}
              max={AVATAR_PARAM_RANGES.chestCm.max}
              value={avatarParams.chestCm}
              onChange={(e) => handleParamChange("chestCm", parseInt(e.target.value))}
              className="w-full"
              aria-label={`Chest slider: ${avatarParams.chestCm} cm`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waist: {avatarParams.waistCm} cm
            </label>
            <input
              type="range"
              min={AVATAR_PARAM_RANGES.waistCm.min}
              max={AVATAR_PARAM_RANGES.waistCm.max}
              value={avatarParams.waistCm}
              onChange={(e) => handleParamChange("waistCm", parseInt(e.target.value))}
              className="w-full"
              aria-label={`Waist slider: ${avatarParams.waistCm} cm`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hip: {avatarParams.hipCm} cm
            </label>
            <input
              type="range"
              min={AVATAR_PARAM_RANGES.hipCm.min}
              max={AVATAR_PARAM_RANGES.hipCm.max}
              value={avatarParams.hipCm}
              onChange={(e) => handleParamChange("hipCm", parseInt(e.target.value))}
              className="w-full"
              aria-label={`Hip slider: ${avatarParams.hipCm} cm`}
            />
          </div>
        </div>
      )}

      {/* Outfit options controls */}
      {activeTab === "outfit" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-label="Select outfit style"
            >
              <option>Casual</option>
              <option>Formal</option>
              <option>Athletic</option>
              <option>Business</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {["#000000", "#0047AB", "#DC143C", "#228B22", "#FFD700"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <div className="flex space-x-2">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Bar - contextual to the active tab */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">AI Assistant</span>
          <Link
            href="/settings/ai"
            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Settings
          </Link>
        </div>
        <AIPromptBar
          context={activeTab === "body" ? "body-tweak" : "style-suggestion"}
        />
        <div className="mt-1 text-xs text-gray-400 flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          Using {settings.engine === "openai" ? "Anna" :
                 settings.engine === "gemini" ? "Gemini" :
                 settings.engine === "mistral" ? "Mistral" :
                 "Custom"} AI
        </div>
      </div>
    </aside>
  );
}