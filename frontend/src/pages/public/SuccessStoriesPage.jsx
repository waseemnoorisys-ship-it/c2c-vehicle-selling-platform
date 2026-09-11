import { Link } from "react-router-dom";

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: "Marcus Vance",
      location: "Munich, Germany",
      role: "Seller",
      vehicle: "2021 Porsche Taycan 4S",
      soldPrice: "$78,500",
      timeToSell: "4 Days",
      quote: "Dealerships offered me $64,000 as trade-in. With C2C Motors, I got verified by their inspector, listed on Monday, and had escrow funds wire-transferred directly to my account by Thursday!",
      avatar: "MV",
    },
    {
      name: "Sophia Chen",
      location: "Amsterdam, Netherlands",
      role: "Buyer",
      vehicle: "2020 Audi Q7 55 TFSI",
      soldPrice: "$52,000",
      timeToSell: "Purchased in 2 Days",
      quote: "Buying a high-end luxury SUV directly from a private seller used to scare me. C2C's 200-point inspection report and Escrow Vault gave me 100% confidence. Car arrived spotless!",
      avatar: "SC",
    },
    {
      name: "David Kovač",
      location: "Vienna, Austria",
      role: "Seller",
      vehicle: "2022 BMW M4 Competition",
      soldPrice: "$84,000",
      timeToSell: "6 Days",
      quote: "The offer pre-funding feature is brilliant. Zero lowball messages from time-wasters. Every buyer who sent me an offer had their cash pre-locked in escrow.",
      avatar: "DK",
    },
  ];

  return (
    <div className="space-y-14 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Verified Reviews & Case Studies
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Community <span className="gradient-text">Success Stories</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted">
          Read how buyers and sellers across Europe are trading vehicles safely without traditional dealership markups.
        </p>
      </div>

      {/* Stories Cards */}
      <div className="space-y-6">
        {stories.map((s) => (
          <div key={s.name} className="p-8 rounded-3xl bg-surface border border-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-500/10 text-text-accent flex items-center justify-center font-bold text-lg">
                  {s.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{s.name}</h3>
                  <p className="text-xs text-text-muted">{s.location} • <span className="text-text-accent font-semibold">{s.role}</span></p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-text-primary">{s.vehicle}</p>
                <p className="text-xs text-text-accent font-semibold">Sold for {s.soldPrice} ({s.timeToSell})</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-text-muted italic leading-relaxed">
              "{s.quote}"
            </p>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Ready to Write Your Success Story?</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Join tens of thousands of satisfied buyers and sellers on C2C Motors today.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/browse" className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold">
            Browse Inventory
          </Link>
          <Link to="/sell" className="px-6 py-2.5 rounded-xl border border-border text-text-primary hover:bg-surface-hover text-sm font-semibold transition">
            Sell Your Car
          </Link>
        </div>
      </div>
    </div>
  );
}
