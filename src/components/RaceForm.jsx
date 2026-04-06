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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section A: Race Details */}
      <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700/60">
        <h2 className="font-barlow-condensed font-bold text-white text-lg uppercase tracking-widest mb-5 flex items-center gap-3">
          <span className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center text-sm font-extrabold font-barlow-condensed flex-shrink-0">
            A
          </span>
          Race Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="distance"
            label="Race Distance"
            value={form.distance}
            onChange={(v) => update("distance", v)}
            options={DISTANCES}
          />
          {form.distance === "Ultra" && (
            <InputField
              id="ultraKm"
              label="Distance (km)"
              type="number"
              value={form.ultraKm}
              onChange={(v) => update("ultraKm", v)}
              placeholder="e.g. 50, 80, 100"
            />
          )}
          <InputField
            id="goalTime"
            label="Goal Time"
            value={form.goalTime}
            onChange={(v) => update("goalTime", v)}
            placeholder="HH:MM:SS or MM:SS (optional)"
          />
          <InputField
            id="raceDate"
            label="Race Date"
            type="date"
            value={form.raceDate}
            onChange={(v) => update("raceDate", v)}
          />
          <InputField
            id="location"
            label="Race Location / City"
            value={form.location}
            onChange={(v) => update("location", v)}
            placeholder="e.g. Boston, MA"
          />
          <SelectField
            id="elevation"
            label="Elevation Profile"
            value={form.elevation}
            onChange={(v) => update("elevation", v)}
            options={ELEVATIONS}
          />
          <SelectField
            id="weather"
            label="Expected Weather"
            value={form.weather}
            onChange={(v) => update("weather", v)}
            options={WEATHER}
          />
          <SelectField
            id="humidity"
            label="Expected Humidity"
            value={form.humidity}
            onChange={(v) => update("humidity", v)}
            options={HUMIDITY}
          />
        </div>
      </section>

      {/* Section B: Athlete Profile */}
      <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700/60">
        <h2 className="font-barlow-condensed font-bold text-white text-lg uppercase tracking-widest mb-5 flex items-center gap-3">
          <span className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center text-sm font-extrabold font-barlow-condensed flex-shrink-0">
            B
          </span>
          Athlete Profile
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="experience"
            label="Experience Level"
            value={form.experience}
            onChange={(v) => update("experience", v)}
            options={EXPERIENCE}
          />
          <div>
            <label htmlFor="weeklyMileage" className="block text-sm font-medium text-gray-300 font-barlow mb-1.5">
              Weekly Mileage
            </label>
            <div className="flex gap-2">
              <input
                id="weeklyMileage"
                type="number"
                value={form.weeklyMileage}
                onChange={(e) => update("weeklyMileage", e.target.value)}
                placeholder="e.g. 40"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 font-barlow"
              />
              <button
                type="button"
                onClick={() => update("unit", form.unit === "km" ? "miles" : "km")}
                className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors duration-200 min-w-[60px] cursor-pointer font-barlow"
              >
                {form.unit}
              </button>
            </div>
          </div>
          <InputField
            id="longestRun"
            label={`Longest Recent Run (${form.unit})`}
            type="number"
            value={form.longestRun}
            onChange={(v) => update("longestRun", v)}
            placeholder="e.g. 25"
          />
          <SelectField
            id="fuelType"
            label="Preferred Fuel Type"
            value={form.fuelType}
            onChange={(v) => update("fuelType", v)}
            options={FUEL_TYPES}
          />
        </div>

        <div className="mt-5">
          <p className="block text-sm font-medium text-gray-300 font-barlow mb-2.5">
            Known Sensitivities
          </p>
          <div className="flex flex-wrap gap-2">
            {SENSITIVITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleSensitivity(item)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer font-barlow ${
                  form.sensitivities.includes(item)
                    ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-barlow-condensed font-bold py-4 rounded-xl text-xl uppercase tracking-widest transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-green-500/20 disabled:shadow-none"
      >
        {isLoading ? "Generating..." : "Generate My Race Strategy"}
      </button>
    </form>
  );
}

function InputField({ id, label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 font-barlow mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 font-barlow"
      />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 font-barlow mb-1.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 cursor-pointer font-barlow"
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
