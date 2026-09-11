import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LandingHeader from "../landing/LandingHeader";
import LandingFooter from "../landing/LandingFooter";

export default function PublicLayout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <LandingHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
