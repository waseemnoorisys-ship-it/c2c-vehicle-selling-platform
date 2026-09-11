import { useState } from "react";
import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState("buyer");

  const buyerSteps = [
    {
      step: "01",
      title: "Browse Verified Listings",
      desc: "Explore thousands of certified cars with detailed 200-point inspection reports, HD photo galleries, and complete VIN history checks.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Make an Offer & Chat Directly",
      desc: "Negotiate securely with verified private sellers or dealership vendors using our real-time messaging system.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      step: "03",
      title: "Deposit Funds in Escrow",
      desc: "Your payment is locked safely in our regulated Escrow Vault. The seller gets paid only when you inspect and accept the vehicle.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      step: "04",
      title: "Inspect & Drive Away",
      desc: "Meet the seller for handover or get delivery right to your doorstep. Confirm condition and enjoy your new car!",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const sellerSteps = [
    {
      step: "01",
      title: "List Vehicle in Minutes",
      desc: "Enter your VIN or vehicle details. Our smart pricing engine suggests optimal market rates to maximize your returns.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Pass Inspection & Get Verified",
      desc: "Get your vehicle inspected by our certified technician to unlock the 'Verified Seller' badge for 3x higher buyer interest.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      step: "03",
      title: "Accept Verified Offers",
      desc: "Review binding offers from serious buyers backed by pre-funded escrow accounts. Zero time-wasters or lowball spammers.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      step: "04",
      title: "Hand Over & Receive Instant Payment",
      desc: "Sign digital ownership transfer documents. Once buyer confirms handover, funds release instantly to your bank account.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const currentSteps = activeRole === "buyer" ? buyerSteps : sellerSteps;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Seamless & Secure Marketplace
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          How <span className="gradient-text">C2C Motors</span> Works
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          We eliminated the stress of buying and selling cars by introducing bank-grade Escrow security, multi-point vehicle inspection, and direct buyer-seller communication.
        </p>
      </div>

      {/* Role Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-xl bg-surface border border-border">
          <button
            type="button"
            onClick={() => setActiveRole("buyer")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeRole === "buyer"
                ? "btn-gradient text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            For Buyers 🚗
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("seller")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeRole === "seller"
                ? "btn-gradient text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            For Sellers 💰
          </button>
        </div>
      </div>

      {/* Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentSteps.map((s) => (
          <div
            key={s.step}
            className="p-6 rounded-2xl bg-surface border border-border hover:border-primary-500/50 transition duration-300 relative group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-primary-500/10 text-text-accent flex items-center justify-center font-bold">
                  {s.icon}
                </span>
                <span className="text-2xl font-black text-text-muted/40 font-display">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-text-accent transition">
                {s.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Escrow Guarantee Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-surface via-surface-hover to-surface border border-border relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-text-accent font-bold text-sm uppercase tracking-wide">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Escrow Protection Guarantee
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Your money is safe until you hold the key.
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              When buying through C2C Motors, your payment is transferred into a secure, regulated escrow vault. Funds are only released to the seller after both parties digitally sign the handover agreement.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              to="/browse"
              className="px-6 py-3 rounded-xl btn-gradient text-white font-semibold text-center text-sm uppercase tracking-wide"
            >
              Browse Inventory
            </Link>
            <Link
              to="/sell"
              className="px-6 py-3 rounded-xl border border-border text-text-primary hover:bg-surface-hover font-semibold text-center text-sm transition"
            >
              Sell Your Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
