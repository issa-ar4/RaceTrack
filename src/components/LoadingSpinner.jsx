export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-slate-200">
          Generating your race plan...
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Analyzing your profile and building a custom strategy
        </p>
      </div>
      {/* Skeleton pulse blocks */}
      <div className="w-full max-w-xl space-y-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div
              className="h-4 bg-slate-700/50 rounded animate-pulse"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
            <div
              className="h-3 bg-slate-700/30 rounded animate-pulse"
              style={{ width: `${50 + Math.random() * 40}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
