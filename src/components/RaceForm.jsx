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

// Parse a time string (HH:MM:SS or MM:SS) into total seconds, or null if invalid.
function parseTime(str) {
  const trimmed = str.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.length === 2) {
    const [minStr, secStr] = parts;
    if (secStr.length !== 2) return null;
    const m = parseInt(minStr, 10);
    const s = parseInt(secStr, 10);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return m * 60 + s;
  }
  if (parts.length === 3) {
    const [hrStr, minStr, secStr] = parts;
    if (minStr.length !== 2 || secStr.length !== 2) return null;
    const h = parseInt(hrStr, 10);
    const m = parseInt(minStr, 10);
    const s = parseInt(secStr, 10);
    if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
    if (h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }
  return null;
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Minimum realistic finish times (world-class level — below these is physically impossible)
const MIN_TIMES = {
  "5K": 10 * 60,
  "10K": 22 * 60,
  "Half Marathon": 55 * 60,
  Marathon: 2 * 3600,
  Ultra: 2 * 3600,
};

function validate(form) {
  const errors = {};

  // Ultra distance
  if (form.distance === "Ultra") {
    if (!form.ultraKm) {
      errors.ultraKm = "Distance is required for Ultra";
    } else {
      const km = parseFloat(form.ultraKm);
      if (isNaN(km) || km <= 0) {
        errors.ultraKm = "Must be a positive number";
      } else if (km <= 42.2) {
        errors.ultraKm = "Must be longer than a marathon (> 42.2 km)";
      } else if (km > 500) {
        errors.ultraKm = "Seems too high — max 500 km";
      } else if (!Number.isFinite(km)) {
        errors.ultraKm = "Must be a valid number";
      }
    }
  }

  // Goal time
  if (form.goalTime) {
    const seconds = parseTime(form.goalTime);
    if (seconds === null) {
      errors.goalTime = "Use HH:MM:SS or MM:SS format (e.g. 1:45:00 or 22:30)";
    } else if (seconds === 0) {
      errors.goalTime = "Goal time must be greater than zero";
    } else {
      const distKey = form.distance === "Ultra" ? "Ultra" : form.distance;
      const minTime = MIN_TIMES[distKey];
      if (minTime && seconds < minTime) {
        errors.goalTime = `Unrealistically fast for ${distKey} — minimum is ~${formatTime(minTime)}`;
      }
    }
  }

  // Race date
  if (form.raceDate) {
    const date = new Date(form.raceDate);
    if (isNaN(date.getTime())) {
      errors.raceDate = "Invalid date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.raceDate = "Race date cannot be in the past";
      } else {
        const twoYearsOut = new Date();
        twoYearsOut.setFullYear(twoYearsOut.getFullYear() + 2);
        if (date > twoYearsOut) {
          errors.raceDate = "Race date is too far out — max 2 years";
        }
      }
    }
  }

  // Weekly mileage
  if (form.weeklyMileage !== "") {
    const val = parseFloat(form.weeklyMileage);
    if (isNaN(val) || val <= 0) {
      errors.weeklyMileage = "Must be a positive number";
    } else if (!Number.isFinite(val)) {
      errors.weeklyMileage = "Must be a valid number";
    } else {
      const max = form.unit === "km" ? 300 : 200;
      if (val > max) {
        errors.weeklyMileage = `Seems too high — max ${max} ${form.unit}/week`;
      }
    }
  }

  // Longest run
  if (form.longestRun !== "") {
    const val = parseFloat(form.longestRun);
    if (isNaN(val) || val <= 0) {
      errors.longestRun = "Must be a positive number";
    } else if (!Number.isFinite(val)) {
      errors.longestRun = "Must be a valid number";
    } else {
      const maxSingle = form.unit === "km" ? 250 : 160;
      if (val > maxSingle) {
        errors.longestRun = `Seems too high — max ${maxSingle} ${form.unit}`;
      } else if (form.weeklyMileage !== "") {
        const weekly = parseFloat(form.weeklyMileage);
        if (!isNaN(weekly) && weekly > 0 && val > weekly) {
          errors.longestRun = `Can't exceed weekly mileage (${form.weeklyMileage} ${form.unit})`;
        }
      }
    }
  }

  return errors;
}

export default function RaceForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function showError(field) {
    return (touched[field] || attemptedSubmit) && errors[field];
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
    setAttemptedSubmit(true);
    if (hasErrors) return;
    const data = {
      ...form,
      distance:
        form.distance === "Ultra" ? `Ultra (${form.ultraKm}km)` : form.distance,
    };
    onSubmit(data);
  }


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
            onChange={(v) => {
              update("distance", v);
              update("ultraKm", "");
            }}
            options={DISTANCES}
          />
          {form.distance === "Ultra" && (
            <InputField
              id="ultraKm"
              label="Distance (km)"
              type="number"
              value={form.ultraKm}
              onChange={(v) => update("ultraKm", v)}
              onBlur={() => touch("ultraKm")}
              placeholder="e.g. 50, 80, 100"
              error={showError("ultraKm")}
            />
          )}
          <InputField
            id="goalTime"
            label="Goal Time"
            value={form.goalTime}
            onChange={(v) => update("goalTime", v)}
            onBlur={() => touch("goalTime")}
            placeholder="HH:MM:SS or MM:SS (optional)"
            error={showError("goalTime")}
          />
          <InputField
            id="raceDate"
            label="Race Date"
            type="date"
            value={form.raceDate}
            onChange={(v) => update("raceDate", v)}
            onBlur={() => touch("raceDate")}
            error={showError("raceDate")}
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
                onBlur={() => touch("weeklyMileage")}
                placeholder="e.g. 40"
                min="0"
                className={`flex-1 bg-gray-900 border rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors duration-200 font-barlow ${
                  showError("weeklyMileage")
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                }`}
              />
              <button
                type="button"
                onClick={() => update("unit", form.unit === "km" ? "miles" : "km")}
                className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors duration-200 min-w-[60px] cursor-pointer font-barlow"
              >
                {form.unit}
              </button>
            </div>
            {showError("weeklyMileage") && (
              <p className="mt-1.5 text-xs text-red-400 font-barlow">{errors.weeklyMileage}</p>
            )}
          </div>
          <InputField
            id="longestRun"
            label={`Longest Recent Run (${form.unit})`}
            type="number"
            value={form.longestRun}
            onChange={(v) => update("longestRun", v)}
            onBlur={() => touch("longestRun")}
            placeholder="e.g. 25"
            error={showError("longestRun")}
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

      {/* Submit error summary */}
      {attemptedSubmit && hasErrors && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-5 py-4">
          <p className="text-sm text-red-400 font-barlow font-medium mb-1">
            Please fix the following before continuing:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field} className="text-sm text-red-400/80 font-barlow">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-barlow-condensed font-bold py-4 rounded-xl text-xl uppercase tracking-widest transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-green-500/20 disabled:shadow-none"
      >
        {isLoading ? "Generating..." : "Generate My Race Strategy"}
      </button>
    </form>
  );
}

function InputField({ id, label, type = "text", value, onChange, onBlur, placeholder, error }) {
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
        onBlur={onBlur}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors duration-200 font-barlow ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-700 focus:border-orange-500 focus:ring-orange-500"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-barlow">{error}</p>
      )}
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
