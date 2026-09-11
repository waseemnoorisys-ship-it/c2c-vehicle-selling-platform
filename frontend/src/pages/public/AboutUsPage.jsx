import { Link } from "react-router-dom";

export default function AboutUsPage() {
  const stats = [
    { label: "Vehicles Traded", value: "12,500+" },
    { label: "Escrow Volume", value: "$150M+" },
    { label: "Verified Users", value: "45,000+" },
    { label: "Satisfaction Rate", value: "99.2%" },
  ];

  const values = [
    {
      title: "Complete Transparency",
      desc: "No hidden dealership markup or undisclosed accident histories. We reveal full vehicle data and inspection reports upfront.",
      icon: (
        <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Bank-Grade Escrow Vault",
      desc: "Transactions are protected by regulated escrow accounts. Payment is only transferred once buyer physically inspects and approves.",
      icon: (
        <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Certified 200-Point Inspection",
      desc: "Our nationwide team of master mechanics verifies mechanical, structural, and cosmetic integrity before listing publishing.",
      icon: (
        <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Direct Peer-to-Peer Trading",
      desc: "Connect directly with real vehicle owners and serious buyers without pushy sales middlemen or inflated fees.",
      icon: (
        <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const team = [
    { name: "Alexander Vance", role: "Chief Executive Officer", bio: "Ex-Tesla Product Lead with 15+ years in automotive tech." },
    { name: "Elena Rostova", role: "Head of Escrow & Trust", bio: "Former Senior VP of Security at FinTech Global." },
    { name: "Marcus Thorne", role: "VP of Vehicle Inspection", bio: "Master ASE Technician & Motorsport Engineering Lead." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Our Story & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Redefining How Cars Are <span className="gradient-text">Bought & Sold</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          C2C Motors was built on a simple premise: vehicle transactions should be safe, transparent, and fair for both buyers and sellers. No traditional dealership markups. No fraud risk.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl bg-surface border border-border text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-text-accent font-display">
              {s.value}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Our Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Why Thousands Choose C2C Motors
          </h2>
          <p className="text-sm text-text-muted">
            We combine state-of-the-art fintech escrow with master vehicle inspections to make peer-to-peer car trading effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="p-6 rounded-2xl bg-surface border border-border flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-500/10 shrink-0">
                {v.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-primary">{v.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Backed by Automotive & Security Experts
          </h2>
          <p className="text-sm text-text-muted">
            Our team brings together leaders from top automotive manufacturers, financial security, and software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-surface border border-border text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-2xl text-text-accent">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-primary">{t.name}</h4>
                <p className="text-xs text-text-accent font-medium">{t.role}</p>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Ready to Experience Next-Gen Car Trading?</h2>
        <p className="text-sm text-text-muted max-w-xl mx-auto">
          Whether you want to sell your vehicle at market value or find a certified pre-owned car, C2C Motors is here for you.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/browse" className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold">
            Explore Vehicles
          </Link>
          <Link to="/contact" className="px-6 py-2.5 rounded-xl border border-border text-text-primary hover:bg-surface-hover text-sm font-semibold transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
