import { useState } from "react";
import { Link } from "react-router-dom";

export default function PricingToolsPage() {
  const [make, setMake] = useState("BMW");
  const [year, setYear] = useState(2022);
  const [mileage, setMileage] = useState(35000);
  const [condition, setCondition] = useState("Excellent");

  // Dynamic Valuation Math Simulation
  const basePrices = {
    BMW: 48000,
    "Mercedes-Benz": 52000,
    Audi: 46000,
    Porsche: 75000,
    Tesla: 42000,
    Toyota: 28000,
  };

  const conditionMultipliers = {
    Excellent: 1.05,
    "Very Good": 1.0,
    Good: 0.92,
    Fair: 0.82,
  };

  const agePenalty = (2026 - year) * 0.08;
  const mileagePenalty = (mileage / 10000) * 0.02;

  const base = basePrices[make] || 35000;
  const adjusted = base * (1 - agePenalty - mileagePenalty) * (conditionMultipliers[condition] || 1.0);
  const estimatedPrice = Math.max(8000, Math.round(adjusted));

  const minPrice = Math.round(estimatedPrice * 0.94);
  const maxPrice = Math.round(estimatedPrice * 1.06);
  const tradeInEst = Math.round(estimatedPrice * 0.78);

  return (
    <div className="space-y-14 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Real-Time Market Intelligence
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Vehicle <span className="gradient-text">Valuation Estimator</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          Get an instant, data-driven estimate of your car's true market value based on live transaction records and regional demand data.
        </p>
      </div>

      {/* Estimator Tool Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Enter Vehicle Specs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                Make / Manufacturer
              </label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Audi">Audi</option>
                <option value="Porsche">Porsche</option>
                <option value="Tesla">Tesla</option>
                <option value="Toyota">Toyota</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                Model Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-400"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-text-muted">Current Odometer</span>
              <span className="text-text-accent font-bold">{mileage.toLocaleString()} km</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
          </div>

          {/* Condition Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-muted uppercase">
              Overall Vehicle Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Excellent", "Very Good", "Good", "Fair"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    condition === c
                      ? "btn-gradient text-white shadow-md"
                      : "bg-background text-text-muted border border-border hover:text-text-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Estimated Private Party Value
            </span>
            <div className="text-4xl font-extrabold text-text-accent mt-1 font-display">
              ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
            </div>
            <p className="text-xs text-text-muted mt-1">Based on recent peer-to-peer sales data.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Expected C2C Selling Time:</span>
              <span className="font-semibold text-text-primary">12 - 18 Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Typical Trade-In Offer:</span>
              <span className="font-semibold text-red-400 line-through">${tradeInEst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-text-accent">
              <span>Your Profit Premium vs Trade-In:</span>
              <span>+${(estimatedPrice - tradeInEst).toLocaleString()}</span>
            </div>
          </div>

          <Link
            to="/sell"
            className="block w-full py-3.5 rounded-xl btn-gradient text-white font-semibold text-center text-sm uppercase tracking-wide shadow-md"
          >
            List This Vehicle Now
          </Link>
        </div>
      </div>
    </div>
  );
}
