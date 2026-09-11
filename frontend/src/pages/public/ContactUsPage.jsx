import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you! Your message has been sent to support.");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    }, 1000);
  }

  const departments = [
    {
      title: "Customer Concierge",
      email: "support@c2c-motors.com",
      phone: "+33 1 23 45 67 89",
      hours: "Mon - Sun: 8:00 AM - 10:00 PM CET",
    },
    {
      title: "Escrow & Dispute Desk",
      email: "escrow@c2c-motors.com",
      phone: "+33 1 23 45 67 90",
      hours: "24/7 Security Operations",
    },
    {
      title: "Dealer & Commercial Sales",
      email: "partners@c2c-motors.com",
      phone: "+33 1 23 45 67 91",
      hours: "Mon - Fri: 9:00 AM - 6:00 PM CET",
    },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          24/7 Dedicated Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          We're Here to <span className="gradient-text">Help You</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          Have a question about a vehicle listing, escrow payment, or seller account? Contact our team and we'll get back to you within 2 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Send Us a Message</h2>
            <p className="text-sm text-text-muted mt-1">Fill out the form below and an agent will reply shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                Topic / Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="general">General Inquiry</option>
                <option value="escrow">Escrow & Payments</option>
                <option value="inspection">Vehicle Inspection & History</option>
                <option value="seller">Seller / Vendor Registration</option>
                <option value="dispute">Report an Issue / Dispute</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                Message *
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we assist you today?"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-gradient text-white font-semibold text-sm uppercase tracking-wide disabled:opacity-50 transition"
            >
              {loading ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Department Info & Map Preview */}
        <div className="space-y-6">
          {departments.map((d) => (
            <div key={d.title} className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <h3 className="text-base font-bold text-text-primary">{d.title}</h3>
              <div className="space-y-2 text-sm text-text-muted">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {d.email}
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {d.phone}
                </p>
                <p className="flex items-center gap-2 text-xs text-text-muted">
                  <svg className="w-4 h-4 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {d.hours}
                </p>
              </div>
            </div>
          ))}

          {/* Headquarters Box */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-2">
            <h3 className="text-base font-bold text-text-primary">Global HQ</h3>
            <p className="text-sm text-text-muted">123 Automotive Blvd, 75008 Paris, France</p>
            <p className="text-xs text-text-accent font-semibold pt-1">Visitors by appointment only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
