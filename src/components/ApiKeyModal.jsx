import { useState } from "react";
import { hasApiKey } from "../lib/groq";

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const keySet = hasApiKey();

  if (!isOpen) return null;

  function handleSave() {
    if (key.trim()) {
      localStorage.setItem("user_groq_key", key.trim());
      setKey("");
      if (onKeySaved) onKeySaved();
      else onClose();
    }
  }

  function handleReset() {
    localStorage.removeItem("user_groq_key");
    setKey("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="font-barlow-condensed font-bold text-white text-xl uppercase tracking-wide">
            API Key Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded-lg hover:bg-gray-700"
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-5">
          <span
            className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-barlow font-medium ${
              keySet
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                : "bg-gray-700/60 text-gray-400 border border-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${keySet ? "bg-orange-400" : "bg-gray-500"}`} />
            {keySet ? "Using your key" : "No key set"}
          </span>
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-400 font-barlow mb-5 leading-relaxed">
          Enter your free Groq API key to generate strategies.{" "}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
          >
            Get one free at console.groq.com
          </a>{" "}
          — no credit card required.
        </p>

        {/* Input */}
        <div className="relative mb-5">
          <label htmlFor="api-key-input" className="sr-only">Groq API Key</label>
          <input
            id="api-key-input"
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 font-barlow"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer font-barlow font-medium px-1 py-0.5"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-barlow font-semibold py-2.5 rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            Save Key
          </button>
          {keySet && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-barlow font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
