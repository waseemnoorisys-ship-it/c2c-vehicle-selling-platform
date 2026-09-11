import { Link } from "react-router-dom";

export default function BuyerProtectionPage() {
  const guarantees = [
    {
      title: "100% Escrow Payment Vault",
      desc: "Your funds are stored securely in a regulated escrow bank account. The seller is only paid after you inspect the car and confirm handover in the app.",
      icon: (
        <svg className="w-8 h-8 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "200-Point Mechanical Inspection",
      desc: "ASE-certified technicians perform physical and OBD diagnostic checks before listing publication. No hidden mechanical defects.",
      icon: (
        <svg className="w-8 h-8 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.18.125l-.26.115a2 2 0 00-1.16 1.83V18A2 2 0 005 20h14a2 2 0 002-2v-.902a2 2 0 00-.572-1.42l-.999-.252z" />
        </svg>
      ),
    },
    {
      title: "Clean Title & VIN Verification",
      desc: "We verify title authenticity, past ownership records, odometer accuracy, and cross-reference national stolen vehicle databases.",
      icon: (
        <svg className="w-8 h-8 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "7-Day Return Guarantee",
      desc: "If the vehicle delivered deviates significantly from the inspection report, our dispute resolution team initiates a full escrow refund.",
      icon: (
        <svg className="w-8 h-8 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  const inspectionAreas = [
    { name: "Powertrain & Transmission", points: "45 Points Checked" },
    { name: "Braking & ABS Hydraulics", points: "30 Points Checked" },
    { name: "Suspension & Steering Alignment", points: "35 Points Checked" },
    { name: "OBD-II Computer Diagnostics", points: "25 Fault Codes Checked" },
    { name: "Interior, HVAC & Electronics", points: "40 Points Checked" },
    { name: "Bodywork, Frame & Paint Gauge", points: "25 Points Checked" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Peace of Mind Guaranteed
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          C2C <span className="gradient-text">Buyer Protection</span> Program
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          Every vehicle transaction on C2C Motors is protected by our multi-tier buyer shield. Buy direct from private sellers without the risk.
        </p>
      </div>

      {/* Main Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guarantees.map((g) => (
          <div key={g.title} className="p-8 rounded-3xl bg-surface border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-primary-500/10 inline-block">
                {g.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary">{g.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 200-Point Inspection Details */}
      <div className="p-8 rounded-3xl bg-surface border border-border space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-text-primary">
            What Our 200-Point Inspection Covers
          </h2>
          <p className="text-sm text-text-muted">
            Our certified inspectors thoroughly check every component before approving a listing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspectionAreas.map((area) => (
            <div key={area.name} className="p-5 rounded-2xl bg-background border border-border flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary">{area.name}</h4>
                <p className="text-xs font-semibold text-text-accent mt-0.5">{area.points}</p>
              </div>
              <svg className="w-5 h-5 text-text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Report Listing Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-surface via-surface-hover to-surface border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-text-primary">Notice an Inaccurate Listing or Suspicious Activity?</h3>
          <p className="text-sm text-text-muted">Report suspicious sellers or listings directly to our Fraud Prevention Unit.</p>
        </div>
        <Link
          to="/contact"
          className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-bold shrink-0 transition"
        >
          Report Listing / Fraud
        </Link>
      </div>
    </div>
  );
}
