import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import BrowseVehicleCard from "../../components/vehicles/BrowseVehicleCard";
import Button from "../../components/common/Button";
import { BUYER_NAV } from "../../config/navigation";
import { fetchSavedVehiclesApi } from "../../api/user.api";
import { mapListingToVehicle } from "../../api/mappers";
import useAuthStore from "../../store/useAuthStore";

export default function BuyerSavedVehiclesPage() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedList = user?.savedVehicles || [];

  useEffect(() => {
    fetchSavedVehicles();
  }, [user?.savedVehicles]);

  async function fetchSavedVehicles() {
    setLoading(true);
    try {
      const res = await fetchSavedVehiclesApi();
      const rawListings = res.data || [];
      const mapped = rawListings.map(mapListingToVehicle);
      setVehicles(mapped);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader
        title="Saved Vehicles"
        subtitle="Your bookmarked listings & favorite vehicles"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-text-accent" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-text-muted">Loading your saved vehicles...</p>
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-border bg-surface max-w-lg mx-auto mt-6 shadow-card">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-text-primary">No Saved Vehicles Yet</h3>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            You haven&apos;t added any vehicles to your wishlist yet. Click the heart ❤️ icon on any vehicle listing to save it here.
          </p>
          <div className="mt-6">
            <Link to="/browse">
              <Button className="w-auto px-6">Browse Vehicles</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {vehicles.map((v) => (
            <BrowseVehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}
