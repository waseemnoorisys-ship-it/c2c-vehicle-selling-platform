import { Link } from "react-router-dom";

export default function SellerGuidePage() {
  const chapters = [
    {
      step: "Chapter 1",
      title: "Vehicle Preparation & Photography",
      desc: "Listings with high-quality photos sell 40% faster. Clean your car thoroughly, choose indirect daylight, and photograph from all 12 key angles (front 3/4, rear 3/4, side profiles, dash, odometer, tire tread, and engine bay).",
    },
    {
      step: "Chapter 2",
      title: "Gathering Required Documentation",
      desc: "Ensure you have the original Vehicle Registration (Title), valid government photo ID, recent maintenance records, and any spare key fobs. Clear any existing bank liens or obtain payoff letters prior to handover.",
    },
    {
      step: "Chapter 3",
      title: "Smart Pricing Strategy",
      desc: "Use our interactive Pricing Tool to calculate fair market value. Set a competitive asking price slightly above your minimum acceptable payout to leave room for friendly buyer negotiations.",
    },
    {
      step: "Chapter 4",
      title: "Navigating Offers & Escrow",
      desc: "Only accept binding offers backed by C2C Escrow funds. Once an offer is accepted, the buyer's funds are secured in trust, ensuring you won't waste time on non-serious inquiries.",
    },
    {
      step: "Chapter 5",
      title: "Safe Handover & Digital Settlement",
      desc: "Meet the buyer in a well-lit public space or arrange verified transport. Once the buyer verifies vehicle condition and signs digital delivery in the app, your funds release instantly.",
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Seller Playbook
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Ultimate Car <span className="gradient-text">Seller's Guide</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted">
          Follow our proven step-by-step guide to prepare, price, and sell your vehicle quickly while securing maximum market value.
        </p>
      </div>

      {/* Chapters Timeline */}
      <div className="space-y-6">
        {chapters.map((c) => (
          <div key={c.step} className="p-6 rounded-2xl bg-surface border border-border space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-accent">
              {c.step}
            </span>
            <h3 className="text-xl font-bold text-text-primary">{c.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Box */}
      <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Ready to Put Your Knowledge into Action?</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Calculate your vehicle's estimated value or start your listing right now.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/pricing-tools" className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold">
            Check Car Valuation
          </Link>
          <Link to="/sell" className="px-6 py-2.5 rounded-xl border border-border text-text-primary hover:bg-surface-hover text-sm font-semibold transition">
            Create Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
