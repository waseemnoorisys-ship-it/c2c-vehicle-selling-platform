import { useState } from "react";
import { Link } from "react-router-dom";

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General" },
    { id: "buying", label: "Buying" },
    { id: "selling", label: "Selling" },
    { id: "escrow", label: "Payments & Escrow" },
    { id: "inspection", label: "Inspection" },
  ];

  const faqs = [
    {
      cat: "general",
      q: "What makes C2C Motors different from traditional classified sites?",
      a: "Unlike passive classified boards where you deal with unknown strangers, C2C Motors acts as a secure intermediary. We verify seller identities, conduct 200-point mechanical inspections, and protect funds in regulated Escrow Vaults until handover is complete.",
    },
    {
      cat: "buying",
      q: "Can I inspect the car before committing payment?",
      a: "Yes! While you deposit your offer funds into Escrow to demonstrate serious purchase intent, the seller never receives funds until you inspect the vehicle, verify condition, and physically accept handover.",
    },
    {
      cat: "buying",
      q: "Are vehicle listings verified for accuracy?",
      a: "Every listing displaying the 'Certified Inspection' badge has been inspected in-person by an ASE-certified technician. We verify VIN records, accident histories, odometer readings, and title authenticity.",
    },
    {
      cat: "selling",
      q: "How much does it cost to list a vehicle?",
      a: "Listing a vehicle on C2C Motors is 100% free for basic sellers. We charge a modest 2.5% platform commission only upon a successful escrow-settled transaction.",
    },
    {
      cat: "selling",
      q: "How fast do sellers get paid after handover?",
      a: "Instantly! Once the buyer signs the digital delivery acceptance via the app, Escrow releases funds directly into your verified bank account via instant SEPA / ACH wire transfer.",
    },
    {
      cat: "escrow",
      q: "How does the Escrow vault protect my money?",
      a: "Escrow funds are held in segregated client trust accounts with top-tier banking partners. Neither the buyer nor the seller can unilaterally withdraw funds during an active transaction without mutual agreement or dispute resolution review.",
    },
    {
      cat: "escrow",
      q: "What happens if the car does not match the description?",
      a: "If the vehicle exhibits un-disclosed mechanical flaws or damage upon handover inspection, you can reject the handover in the app. Our dispute team inspects the claim, and funds are safely returned to your Escrow balance.",
    },
    {
      cat: "inspection",
      q: "How does the 200-point inspection work?",
      a: "Our technicians inspect engine diagnostics, transmission, brakes, suspension, bodywork integrity, electrical systems, and road test performance. Full PDF reports are attached to each vehicle listing.",
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.cat === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Knowledge Base & Help Center
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted">
          Find answers to common questions about buying, selling, escrow security, and vehicle inspection.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <svg className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g. escrow, inspection, fees)..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setActiveCategory(c.id); setOpenIndex(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeCategory === c.id
                ? "btn-gradient text-white shadow-md"
                : "bg-surface text-text-muted border border-border hover:text-text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-surface border border-border space-y-2">
            <p className="text-base font-semibold text-text-primary">No questions found</p>
            <p className="text-sm text-text-muted">Try searching with a different key phrase or select another category.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-surface border border-border overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-text-primary hover:text-text-accent transition"
                >
                  <span className="text-base">{faq.q}</span>
                  <span className="p-1 rounded-lg bg-surface-hover text-text-muted shrink-0">
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-text-accent" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-text-muted leading-relaxed border-t border-border/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-4">
        <h3 className="text-xl font-bold text-text-primary">Still Have Questions?</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Can't find the answer you're looking for? Our concierge support team is online 24/7 to assist you.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-xl btn-gradient text-white text-sm font-semibold uppercase tracking-wide shadow-md"
        >
          Contact Support Desk
        </Link>
      </div>
    </div>
  );
}
