import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function SellVehiclePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vinNumber, setVinNumber] = useState("");

  function handleStartListing(e) {
    e.preventDefault();
    if (user?.role === "vendor") {
      navigate("/vendor/listings/new");
    } else {
      navigate("/register");
    }
  }

  const features = [
    { title: "Direct Escrow Payout", desc: "No check delays or chargebacks. Receive instant bank wire upon handover." },
    { title: "0% Hidden Fees for Basic Plan", desc: "Pay no upfront listing fee. We only collect a small 2.5% fee on final sale." },
    { title: "Nationwide Buyer Reach", desc: "Your listing reaches over 50,000 active, pre-verified vehicle buyers." },
    { title: "Smart Price Optimizer", desc: "Get real-time market valuation recommendations based on live sales data." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Sell Fast & Securely
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Sell Your Vehicle at <span className="gradient-text">Top Market Value</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          Skip dealership lowball trade-in offers. List your car on C2C Motors, connect with pre-funded buyers, and settle via secure Escrow.
        </p>

        {/* VIN / Quick Start Box */}
        <form onSubmit={handleStartListing} className="pt-4 max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={vinNumber}
            onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
            placeholder="Enter VIN or License Plate..."
            className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl btn-gradient text-white text-sm font-semibold uppercase tracking-wide shrink-0"
          >
            Start Listing
          </button>
        </form>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="p-6 rounded-2xl bg-surface border border-border space-y-2">
            <h3 className="text-base font-bold text-text-primary">{f.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing Tier Comparison */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-text-primary">Seller Listing Plans</h2>
          <p className="text-sm text-text-muted">Choose the plan that fits your selling timeline and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="p-8 rounded-3xl bg-surface border border-border space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Standard</span>
              <h3 className="text-2xl font-bold text-text-primary">Private Seller</h3>
              <div className="text-3xl font-extrabold text-text-primary font-display">
                Free <span className="text-xs font-normal text-text-muted">/ listing</span>
              </div>
              <ul className="space-y-2.5 text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Standard Search Visibility
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Escrow Payment Protection
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Direct Buyer Messaging
                </li>
              </ul>
            </div>
            <button
              onClick={handleStartListing}
              className="w-full py-3 rounded-xl border border-border hover:bg-surface-hover text-text-primary text-sm font-semibold transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Verified Plan */}
          <div className="p-8 rounded-3xl bg-surface border-2 border-primary-500/60 relative space-y-6 flex flex-col justify-between shadow-xl">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </span>
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-accent">Verified Tier</span>
              <h3 className="text-2xl font-bold text-text-primary">Certified Pro</h3>
              <div className="text-3xl font-extrabold text-text-primary font-display">
                $49 <span className="text-xs font-normal text-text-muted">one-time inspection fee</span>
              </div>
              <ul className="space-y-2.5 text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Certified 200-Point Inspection Badge
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Featured Listing Placement (Top of Search)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3x Faster Sale Rate on Average
                </li>
              </ul>
            </div>
            <button
              onClick={handleStartListing}
              className="w-full py-3 rounded-xl btn-gradient text-white text-sm font-semibold uppercase tracking-wide shadow-md"
            >
              List as Certified Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
