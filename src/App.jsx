import { useState, useRef } from "react";
import RaceForm from "./components/RaceForm";
import StrategyOutput from "./components/StrategyOutput";
import ApiKeyModal from "./components/ApiKeyModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { callGroq } from "./lib/groq";
import { buildRacePrompt } from "./prompts/raceStrategy";

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("form");
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
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Orange accent line at top */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500" />

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="font-barlow-condensed font-800 text-white text-lg font-extrabold leading-none">R</span>
            </div>
            <div>
              <h1 className="font-barlow-condensed font-bold text-white text-xl leading-tight tracking-wide uppercase">
                RaceTrack AI
              </h1>
              <p className="text-xs text-gray-500 font-barlow tracking-wider uppercase">
                Race Day Strategy
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 text-gray-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
            title="API Key Settings"
            aria-label="API Key Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {view === "form" && (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <h2 className="font-barlow-condensed font-extrabold text-white uppercase leading-none tracking-wide"
                  style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)" }}>
                Plan Your<br />
                <span className="text-orange-500">Perfect Race</span>
              </h2>
              <p className="mt-4 text-gray-400 font-barlow text-base max-w-md mx-auto leading-relaxed">
                Get a personalized pacing plan, fueling schedule, and race day
                checklist — powered by AI.
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
          <div className="max-w-md mx-auto text-center py-16">
            <div className="flex justify-center mb-5">
              <WarningIcon />
            </div>
            <h2 className="font-barlow-condensed font-bold text-white text-2xl uppercase tracking-wide mb-3">
              Something Went Wrong
            </h2>
            <p className="text-gray-400 font-barlow mb-8 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRegenerate}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-barlow font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setView("form")}
                className="px-6 py-2.5 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-barlow font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Edit Inputs
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-600 font-barlow">
            Free tool by{" "}
            <a
              href="https://instagram.com/issa.exercise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500/80 hover:text-orange-400 transition-colors duration-200"
            >
              @issa.exercise
            </a>
          </p>
        </div>
      </footer>

      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </div>
  );
}
