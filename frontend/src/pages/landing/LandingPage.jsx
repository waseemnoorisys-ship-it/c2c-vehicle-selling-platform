import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero.png";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import SectionHeader from "../../components/landing/SectionHeader";
import VehicleCard from "../../components/landing/VehicleCard";
import Button from "../../components/common/Button";
import {
  STATS,
  FEATURED_VEHICLES,
  ADVANTAGES,
  BUYER_STEPS,
  SELLER_STEPS,
  CATEGORIES,
  TESTIMONIALS,
  FAQS,
} from "../../data/landingData";

function StatIcon({ type }) {
  const icons = {
    car: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h2l3-6h2" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    seller: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };
  return (
    <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[type]}
    </svg>
  );
}

function AdvantageIcon() {
  return (
    <div className="w-12 h-12 rounded-xl border border-primary-400/30 bg-primary-500/10 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
  );
}

function StepFlow({ steps, title }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-text-accent uppercase tracking-wide mb-6">
        {title}
      </h3>
      <div className="flex flex-wrap items-center gap-2 sm:gap-0">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <div className="w-10 h-10 rounded-full border border-primary-400/40 bg-primary-500/10 flex items-center justify-center text-text-accent text-sm font-bold">
                {i + 1}
              </div>
              <span className="text-xs text-text-muted mt-2 max-w-[80px]">{step}</span>
            </div>
            {i < steps.length - 1 && (
              <svg className="w-6 h-6 text-text-accent mx-1 sm:mx-2 hidden sm:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-text-primary hover:bg-surface-hover transition"
      >
        {q}
        <svg
          className={`w-5 h-5 text-text-accent shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-border pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex flex-col justify-center">
        <img
          src={heroImage}
          alt="Luxury vehicle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-accent mb-4">
            Trusted. Transparent. Secure.
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight max-w-2xl">
            Buy &amp; Sell Vehicles With{" "}
            <span className="text-text-accent text-glow">Confidence</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-xl">
            Verified vehicle listings, secure payments, and transparent transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              className="sm:w-auto w-full px-8"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
              onClick={() => navigate("/browse")}
            >
              Browse Vehicles
            </Button>
            <Button
              variant="outline"
              className="sm:w-auto w-full px-8 normal-case"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              onClick={() => navigate("/register")}
            >
              Sell Your Vehicle
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-8 lg:pb-12">
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
            {["Make", "Model", "Price Range"].map((label) => (
              <select
                key={label}
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-sm text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
                defaultValue=""
              >
                <option value="" disabled>{label}</option>
                <option>Any</option>
              </select>
            ))}
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-white text-sm font-semibold rounded-lg uppercase tracking-wide shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Vehicles
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <StatIcon type={stat.icon} />
                <div>
                  <p className="font-display text-xl sm:text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader
          label="Featured Vehicles"
          title="Handpicked Vehicles For You"
          linkText="View All Vehicles"
          linkTo="/browse"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_VEHICLES.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="bg-background-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader label="Why Choose Us" title="The C2C Advantage" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border bg-surface hover:border-primary-400/30 transition"
              >
                <AdvantageIcon />
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader label="How It Works" title="Simple Process, Great Results" />
        <div className="grid lg:grid-cols-2 gap-12">
          <StepFlow steps={BUYER_STEPS} title="For Buyers" />
          <StepFlow steps={SELLER_STEPS} title="For Sellers" />
        </div>
      </section>

      {/* Browse By Category */}
      <section className="bg-background-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader
            label="Browse By Category"
            title="Explore Vehicles By Category"
            linkText="View All Categories"
            linkTo="/browse"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate("/browse")}
                className="p-5 rounded-xl border border-border bg-surface hover:border-primary-400/40 hover:bg-surface-hover transition text-center group"
              >
                <svg
                  className="w-12 h-8 mx-auto text-text-muted group-hover:text-text-accent transition mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 11h14l-1.5 6H6.5L5 11zM7 8l1-3h8l1 3" />
                </svg>
                <p className="font-semibold text-text-primary text-sm">{cat.name}</p>
                <p className="text-xs text-text-muted mt-1">{cat.count} vehicles</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader
          label="Verified Vehicles"
          title="100% Inspected. 100% Trusted."
          linkText="View All Verified"
          linkTo="/browse"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_VEHICLES.map((v) => (
            <VehicleCard key={`verified-${v.id}`} vehicle={v} />
          ))}
        </div>
      </section>

      {/* Latest Vehicles */}
      <section className="bg-background-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader
            label="Recently Added"
            title="Latest Vehicles"
            linkText="View All Vehicles"
            linkTo="/browse"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_VEHICLES.map((v) => (
              <VehicleCard key={`latest-${v.id}`} vehicle={v} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader
          label="What Our Customers Say"
          title="Trusted By Thousands"
          linkText="View All Reviews"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-xl border border-border bg-surface"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-400/30 flex items-center justify-center text-text-accent font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.location}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex gap-0.5 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-background-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader
            label="Frequently Asked Questions"
            title="Got Questions? We've Got Answers"
            linkText="View All FAQs"
          />
          <div className="grid md:grid-cols-2 gap-4">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-lg">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary uppercase tracking-wide">
                Ready to Sell Your Vehicle?
              </h2>
              <p className="text-text-secondary mt-3 leading-relaxed">
                List your vehicle today and reach thousands of verified buyers. Fast, secure, and hassle-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button className="sm:w-auto w-full px-8" onClick={() => navigate("/register")}>
                  Post Your Listing
                </Button>
                <Button variant="outline" className="sm:w-auto w-full px-8 normal-case" onClick={() => navigate("/browse")}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-80 h-48 rounded-2xl bg-gradient-to-br from-surface to-background border border-border flex items-center justify-center">
              <svg className="w-24 h-24 text-text-muted/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 11h14l-1.5 6H6.5L5 11zM7 8l1-3h8l1 3M9 14h6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
