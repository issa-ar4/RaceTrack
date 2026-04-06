import { useState } from "react";
import { isUsingDefaultKey } from "../lib/groq";

export default function ApiKeyModal({ isOpen, onClose }) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const usingDefault = isUsingDefaultKey();

  if (!isOpen) return null;

  function handleSave() {
    if (key.trim()) {
      localStorage.setItem("user_groq_key", key.trim());
      setKey("");
      onClose();
    }
  }

  function handleReset() {
    localStorage.removeItem("user_groq_key");
    setKey("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">API Key Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
              usingDefault
                ? "bg-slate-700 text-slate-300"
                : "bg-orange-500/20 text-orange-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${usingDefault ? "bg-slate-400" : "bg-orange-400"}`} />
            {usingDefault ? "Using: default key" : "Using: your key"}
          </span>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Enter your own free Groq API key to avoid rate limits.{" "}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            Get one free at console.groq.com
          </a>{" "}
          — no credit card required.
        </p>

        <div className="relative mb-4">
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Save Key
          </button>
          {!usingDefault && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
            >
              Reset to Default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
