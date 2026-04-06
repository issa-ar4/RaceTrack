import { useState, useRef } from "react";
import RaceForm from "./components/RaceForm";
import StrategyOutput from "./components/StrategyOutput";
import ApiKeyModal from "./components/ApiKeyModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { callGroq } from "./lib/groq";
import { buildRacePrompt } from "./prompts/raceStrategy";

export default function App() {
  const [view, setView] = useState("form"); // "form" | "loading" | "result" | "error"
  const [strategy, setStrategy] = useState("");
  const [error, setError] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const lastFormData = useRef(null);

  async function handleGenerate(formData) {
    lastFormData.current = formData;
    setView("loading");
    setError("");

    const messages = buildRacePrompt(formData);
    const result = await callGroq(messages);

    if (result.success) {
      setStrategy(result.content);
      setView("result");
    } else if (result.rateLimited) {
      setView("form");
      setShowKeyModal(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
      setView("error");
    }
  }

  function handleRegenerate() {
    if (lastFormData.current) {
      handleGenerate(lastFormData.current);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃</span>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">
                RaceTrack AI
              </h1>
              <p className="text-xs text-slate-400">Race Day Strategy Generator</p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="API Key Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {view === "form" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Plan Your Perfect Race
              </h2>
              <p className="text-slate-400">
                Get a personalized pacing plan, fueling schedule, and race day
                checklist powered by AI.
              </p>
            </div>
            <RaceForm onSubmit={handleGenerate} isLoading={false} />
          </div>
        )}

        {view === "loading" && (
          <div className="max-w-2xl mx-auto">
            <LoadingSpinner />
          </div>
        )}

        {view === "result" && (
          <StrategyOutput
            markdown={strategy}
            onRegenerate={handleRegenerate}
            onBack={() => setView("form")}
            isLoading={false}
          />
        )}

        {view === "error" && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRegenerate}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setView("form")}
                className="px-6 py-2.5 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
              >
                Edit Inputs
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Free tool by{" "}
            <a
              href="https://instagram.com/issa.exercise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400/70 hover:text-orange-400 transition-colors"
            >
              @issa.exercise
            </a>
          </p>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </div>
  );
}
