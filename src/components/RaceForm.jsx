import { useState } from "react";

const DISTANCES = ["5K", "10K", "Half Marathon", "Marathon", "Ultra"];
const ELEVATIONS = ["Flat", "Rolling hills", "Hilly", "Mountainous"];
const WEATHER = ["Cool (<10°C)", "Mild (10-20°C)", "Warm (20-30°C)", "Hot (>30°C)"];
const HUMIDITY = ["Low", "Moderate", "High"];
const EXPERIENCE = [
  "Beginner (first race)",
  "Intermediate (2-5 races)",
  "Advanced (5+)",
];
const SENSITIVITIES = [
  "Caffeine",
  "GI issues",
  "Heat sensitivity",
  "Altitude sensitivity",
];
const FUEL_TYPES = ["Gels", "Chews", "Real food", "Liquid nutrition", "Unsure"];

const initialForm = {
  distance: "Half Marathon",
  ultraKm: "",
  goalTime: "",
  raceDate: "",
  location: "",
  elevation: "Flat",
  weather: "Mild (10-20°C)",
  humidity: "Moderate",
  experience: "Intermediate (2-5 races)",
  weeklyMileage: "",
  longestRun: "",
  unit: "km",
  sensitivities: [],
  fuelType: "Gels",
};

export default function RaceForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSensitivity(item) {
    setForm((prev) => ({
      ...prev,
      sensitivities: prev.sensitivities.includes(item)
        ? prev.sensitivities.filter((s) => s !== item)
        : [...prev.sensitivities, item],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      distance:
        form.distance === "Ultra" ? `Ultra (${form.ultraKm}km)` : form.distance,
    };
    onSubmit(data);
  }

  const isValid = form.distance && (form.distance !== "Ultra" || form.ultraKm);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section A: Race Details */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
            A
          </span>
          Race Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Race Distance"
            value={form.distance}
            onChange={(v) => update("distance", v)}
            options={DISTANCES}
          />
          {form.distance === "Ultra" && (
            <InputField
              label="Distance (km)"
              type="number"
              value={form.ultraKm}
              onChange={(v) => update("ultraKm", v)}
              placeholder="e.g. 50, 80, 100"
            />
          )}
          <InputField
            label="Goal Time"
            value={form.goalTime}
            onChange={(v) => update("goalTime", v)}
            placeholder="HH:MM:SS or MM:SS (optional)"
          />
          <InputField
            label="Race Date"
            type="date"
            value={form.raceDate}
            onChange={(v) => update("raceDate", v)}
          />
          <InputField
            label="Race Location / City"
            value={form.location}
            onChange={(v) => update("location", v)}
            placeholder="e.g. Boston, MA"
          />
          <SelectField
            label="Elevation Profile"
            value={form.elevation}
            onChange={(v) => update("elevation", v)}
            options={ELEVATIONS}
          />
          <SelectField
            label="Expected Weather"
            value={form.weather}
            onChange={(v) => update("weather", v)}
            options={WEATHER}
          />
          <SelectField
            label="Expected Humidity"
            value={form.humidity}
            onChange={(v) => update("humidity", v)}
            options={HUMIDITY}
          />
        </div>
      </div>

      {/* Section B: Athlete Profile */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
            B
          </span>
          Athlete Profile
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Experience Level"
            value={form.experience}
            onChange={(v) => update("experience", v)}
            options={EXPERIENCE}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Weekly Mileage
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.weeklyMileage}
                onChange={(e) => update("weeklyMileage", e.target.value)}
                placeholder="e.g. 40"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() =>
                  update("unit", form.unit === "km" ? "miles" : "km")
                }
                className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-medium text-slate-300 transition-colors min-w-[60px]"
              >
                {form.unit}
              </button>
            </div>
          </div>
          <InputField
            label={`Longest Recent Run (${form.unit})`}
            type="number"
            value={form.longestRun}
            onChange={(v) => update("longestRun", v)}
            placeholder="e.g. 25"
          />
          <SelectField
            label="Preferred Fuel Type"
            value={form.fuelType}
            onChange={(v) => update("fuelType", v)}
            options={FUEL_TYPES}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Known Sensitivities
          </label>
          <div className="flex flex-wrap gap-2">
            {SENSITIVITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleSensitivity(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.sensitivities.includes(item)
                    ? "bg-orange-500/20 border-orange-500 text-orange-400"
                    : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl text-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating..." : "Generate My Race Strategy"}
      </button>
    </form>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
