const SKELETON_WIDTHS = ["75%", "90%", "60%", "82%", "68%", "88%"];

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-green-500/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-barlow-condensed font-bold text-white text-2xl uppercase tracking-widest">
          Building Your Strategy
        </p>
        <p className="font-barlow text-gray-500 text-sm mt-1.5">
          Analyzing your profile and building a custom plan...
        </p>
      </div>

      {/* Skeleton */}
      <div className="w-full max-w-xl space-y-5">
        {[
          { label: "PACING STRATEGY", lines: 3 },
          { label: "FUELING PLAN", lines: 2 },
        ].map((section, si) => (
          <div key={si} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
            <div className="h-4 bg-orange-500/20 rounded mb-3 w-36 animate-pulse" />
            {Array.from({ length: section.lines }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-gray-700/50 rounded animate-pulse mb-2"
                style={{ width: SKELETON_WIDTHS[(si * 3 + i) % SKELETON_WIDTHS.length] }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
