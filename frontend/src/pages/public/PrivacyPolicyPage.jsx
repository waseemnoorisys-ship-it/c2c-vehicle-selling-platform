export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-text-muted leading-relaxed">
      <div className="space-y-3 pb-6 border-b border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-text-accent">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display">
          Privacy Policy
        </h1>
        <p className="text-xs text-text-muted">Last Updated: September 11, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">1. Overview</h2>
        <p className="text-sm">
          At C2C Motors ("we", "our", or "us"), protecting your personal data is a top priority. This Privacy Policy describes how we collect, process, store, and share your personal information when you access or use our peer-to-peer vehicle selling platform, mobile applications, escrow services, and customer support channels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">2. Information We Collect</h2>
        <p className="text-sm">We collect information directly provided by you, as well as data automatically gathered during your platform interactions:</p>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li><strong className="text-text-primary">Account Identification Data:</strong> Full legal name, email address, phone number, physical residential address, and government-issued photo ID (for KYC compliance).</li>
          <li><strong className="text-text-primary">Vehicle Data:</strong> Vehicle Identification Numbers (VIN), title ownership documents, maintenance records, vehicle photos, and inspection results.</li>
          <li><strong className="text-text-primary">Financial & Escrow Details:</strong> Bank account numbers (IBAN/SWIFT), payment card tokens, transaction history, and escrow settlement logs processed via our regulated banking partners.</li>
          <li><strong className="text-text-primary">Technical Analytics:</strong> Device IP address, browser type, location data, and cookies for security and performance optimization.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">3. How We Use Your Information</h2>
        <p className="text-sm">Your data is utilized strictly to provide, secure, and improve our services, including:</p>
        <ul className="list-disc pl-5 text-sm space-y-1.5">
          <li>Verifying buyer and seller identities to prevent fraud and impersonation.</li>
          <li>Executing secure peer-to-peer escrow transactions and processing instant payouts.</li>
          <li>Generating certified vehicle inspection reports and VIN history checks.</li>
          <li>Facilitating buyer-seller chat communications.</li>
          <li>Complying with anti-money laundering (AML) and know-your-customer (KYC) legal obligations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">4. Data Sharing & Third Parties</h2>
        <p className="text-sm">
          We never sell your personal information to third-party advertisers. We share necessary data only with regulated financial banking partners (for escrow holding), certified vehicle inspection technicians, and legal law enforcement authorities when mandated by court order.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">5. Your GDPR Rights</h2>
        <p className="text-sm">
          Under the General Data Protection Regulation (GDPR), you hold the right to access, rectify, export, or request the deletion of your personal records. To submit a data request, please contact our Data Protection Officer at <span className="text-text-accent font-semibold">dpo@c2c-motors.com</span>.
        </p>
      </section>
    </div>
  );
}
