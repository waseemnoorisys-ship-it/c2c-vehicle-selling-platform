import heroImage from "../../assets/hero.png";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
        <AppHeader showBack />

        <div className="flex-1 flex flex-col lg:flex-row m-4 sm:m-6 rounded-2xl overflow-hidden border border-border shadow-card bg-surface">
          {/* Hero panel */}
          <div className="relative lg:w-1/2 min-h-[220px] lg:min-h-[600px]">
            <img
              src={heroImage}
              alt="High-performance vehicle"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-overlay" />

            <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between h-full">
              <div className="hidden lg:block text-right text-[10px] font-mono text-text-muted space-y-0.5">
                <p>CHASSIS_INTEL_V.4.22</p>
                <p>SECURE_CORE_ACTIVE</p>
                <p>EST. 2024</p>
              </div>

              <div className="mt-auto lg:mt-0">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-text-primary leading-tight">
                  Established Precision.
                </h2>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-text-accent text-glow leading-tight mt-1">
                  Experience Performance.
                </h2>
                <p className="mt-4 text-sm text-text-secondary max-w-sm hidden sm:block">
                  The ultimate digital command center for your high-performance vehicle portfolio.
                </p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-surface">
            <div className="w-full max-w-md">
              {(title || subtitle) && (
                <div className="mb-8">
                  {title && (
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-text-muted text-sm mt-2">{subtitle}</p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
