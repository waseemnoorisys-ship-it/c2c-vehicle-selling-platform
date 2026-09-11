export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-text-muted leading-relaxed">
      <div className="space-y-3 pb-6 border-b border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-text-accent">
          Terms & Conditions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display">
          Terms of Service
        </h1>
        <p className="text-xs text-text-muted">Last Updated: September 11, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">1. Agreement to Terms</h2>
        <p className="text-sm">
          By registering, accessing, or using the C2C Motors platform, you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">2. User Eligibility & Account Responsibilities</h2>
        <p className="text-sm">
          To register as a Buyer or Seller (Vendor), you must be at least 18 years of age and hold legal capacity to enter binding contracts. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">3. Vehicle Listing & Seller Obligations</h2>
        <p className="text-sm">Sellers explicitly warrant that:</p>
        <ul className="list-disc pl-5 text-sm space-y-1.5">
          <li>They hold sole legal title to any vehicle listed, free and clear of un-disclosed liens or legal encumbrances.</li>
          <li>All vehicle specifications, mileage readings, accident histories, and condition details are 100% accurate.</li>
          <li>They will permit physical inspection of the vehicle by certified C2C mechanics.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">4. Escrow Payment & Settlement Terms</h2>
        <p className="text-sm">
          All financial transactions are conducted through our licensed Escrow Vault partners. Offers accepted by sellers bind buyers to deposit funds into Escrow within 48 hours. Funds remain locked until the buyer signs digital acceptance upon vehicle handover.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">5. Platform Commission & Fees</h2>
        <p className="text-sm">
          C2C Motors charges a 2.5% platform commission on completed vehicle sales. Fees are automatically deducted upon final escrow payout. Inspection fees for Certified Pro listings are non-refundable once inspection services have been initiated.
        </p>
      </section>
    </div>
  );
}
