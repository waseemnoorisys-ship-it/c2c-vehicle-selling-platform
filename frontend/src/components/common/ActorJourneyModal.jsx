import { useState } from "react";

export default function ActorJourneyModal({ isOpen, onClose }) {
  const [activeRole, setActiveRole] = useState("vendor");

  if (!isOpen) return null;

  const journeys = {
    vendor: {
      title: "Vendor (Seller) Journey",
      subtitle: "From listing creation to sold vehicle and bank payout withdrawal",
      color: "emerald",
      steps: [
        {
          num: "1",
          title: "Account Registration",
          desc: "Vendor registers account with Seller role and verifies credentials.",
        },
        {
          num: "2",
          title: "Submit Vehicle Listing",
          desc: "Enters vehicle specs (Make, Model, Year, Mileage, Asking Price) and uploads photos.",
        },
        {
          num: "3",
          title: "Admin Moderation Queue",
          desc: "Listing enters Pending queue for Admin review and specification verification.",
        },
        {
          num: "4",
          title: "Public Listing & Buyer Chat",
          desc: "Once approved, car appears live on Browse page. Buyer initiates WhatsApp-style chat.",
        },
        {
          num: "5",
          title: "Accept Offer & Mark Sold",
          desc: "Vendor accepts buyer price offer. Listing transitions to Sold status.",
        },
        {
          num: "6",
          title: "Bank Payout Withdrawal",
          desc: "Escrow funds are credited to vendor wallet. Vendor submits withdrawal to bank account.",
        },
      ],
    },
    buyer: {
      title: "Buyer Journey",
      subtitle: "Vehicle discovery, direct chat negotiation, and offer purchase",
      color: "cyan",
      steps: [
        {
          num: "1",
          title: "Browse & Spatial Search",
          desc: "Filters car listings by brand, price range, mileage, fuel type, or Near Me location.",
        },
        {
          num: "2",
          title: "Inspect Specs & Photos",
          desc: "Views high-resolution gallery, seller badges, asking price, and vehicle location.",
        },
        {
          num: "3",
          title: "Real-time Messaging",
          desc: "Launches direct WhatsApp-style chat to ask questions or send voice notes.",
        },
        {
          num: "4",
          title: "Submit Official Offer",
          desc: "Submits purchase offer directly to vendor through offer dialog.",
        },
        {
          num: "5",
          title: "Deal Completion",
          desc: "Upon offer acceptance, buyer completes deal and reviews seller rating.",
        },
      ],
    },
    admin: {
      title: "Super Admin Journey",
      subtitle: "Platform analytics oversight, listing moderation, payouts & master data",
      color: "amber",
      steps: [
        {
          num: "1",
          title: "Real-time Analytics Dashboard",
          desc: "Monitors platform revenue, commission earned, brand market share, and user growth.",
        },
        {
          num: "2",
          title: "Listing Moderation",
          desc: "Reviews pending car listings, approves valid submissions, or rejects with reason.",
        },
        {
          num: "3",
          title: "Vendor Payout Processing",
          desc: "Reviews vendor withdrawal requests, verifies bank details, and marks payouts paid.",
        },
        {
          num: "4",
          title: "Master Data Management",
          desc: "Adds new vehicle Makes and Models to system master database dynamically.",
        },
      ],
    },
  };

  const current = journeys[activeRole];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-surface border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary">
              C2C Platform User Flow & Actor Journeys
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Explore how Vendors, Buyers, and Super Admins navigate the platform
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background border border-border text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setActiveRole("vendor")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeRole === "vendor"
                ? "bg-emerald-500/15 text-emerald-400 border-t-2 border-emerald-500"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            🚗 Vendor (Seller) Flow
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("buyer")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeRole === "buyer"
                ? "bg-cyan-500/15 text-cyan-400 border-t-2 border-cyan-500"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            🛒 Buyer Flow
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("admin")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeRole === "admin"
                ? "bg-amber-500/15 text-amber-400 border-t-2 border-amber-500"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            🛡️ Super Admin Flow
          </button>
        </div>

        {/* Steps Stream */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="mb-4">
            <h3 className="font-display text-base font-bold text-text-primary">
              {current.title}
            </h3>
            <p className="text-xs text-text-muted">{current.subtitle}</p>
          </div>

          <div className="space-y-3">
            {current.steps.map((step) => (
              <div
                key={step.num}
                className="p-4 rounded-xl border border-border bg-background flex items-start gap-4 shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-500/30">
                  {step.num}
                </span>
                <div>
                  <h4 className="font-bold text-xs text-text-primary">
                    {step.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
