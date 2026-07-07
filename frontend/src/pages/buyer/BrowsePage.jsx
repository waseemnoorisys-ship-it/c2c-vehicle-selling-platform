import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import PageHeader from "../../components/dashboard/PageHeader";
import BrowseVehicleCard from "../../components/vehicles/BrowseVehicleCard";
import { fetchVehicles, fetchFilterOptions } from "../../api/vehicles.api";
import useAuthStore from "../../store/useAuthStore";

export default function BrowsePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isBuyer = user?.role === "buyer";

  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ make: "", bodyType: "", fuel: "", minPrice: "", maxPrice: "", search: "" });
  const [options, setOptions] = useState({ makes: [], bodyTypes: [], fuelTypes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions().then((res) => setOptions(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.make) params.make = filters.make;
    if (filters.bodyType) params.bodyType = filters.bodyType;
    if (filters.fuel) params.fuel = filters.fuel;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.search) params.search = filters.search;
    fetchVehicles(params).then((res) => {
      setVehicles(res.data.data);
      setLoading(false);
    });
  }, [filters]);

  const content = (
  <>
      <PageHeader
        title="Browse Vehicles"
        subtitle={`${vehicles.length} vehicles available`}
        action={
          isBuyer ? (
            <button
              type="button"
              onClick={() => navigate("/buyer/dashboard")}
              className="text-sm text-text-accent hover:underline"
            >
              Go to Dashboard →
            </button>
          ) : null
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 sticky top-20">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Filters</h3>

            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
            />

            <div>
              <label className="text-xs text-text-muted mb-1 block">Make</label>
              <select
                value={filters.make}
                onChange={(e) => setFilters((f) => ({ ...f, make: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary outline-none"
              >
                <option value="">All Makes</option>
                {options.makes?.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">Body Type</label>
              <select
                value={filters.bodyType}
                onChange={(e) => setFilters((f) => ({ ...f, bodyType: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary outline-none"
              >
                <option value="">All Types</option>
                {options.bodyTypes?.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">Fuel</label>
              <select
                value={filters.fuel}
                onChange={(e) => setFilters((f) => ({ ...f, fuel: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary outline-none"
              >
                <option value="">All Fuel Types</option>
                {options.fuelTypes?.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Min €</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Max €</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text-primary outline-none"
                  placeholder="100000"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilters({ make: "", bodyType: "", fuel: "", minPrice: "", maxPrice: "", search: "" })}
              className="w-full py-2 text-sm text-text-muted hover:text-text-accent border border-border rounded-lg hover:bg-surface-hover transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-text-muted">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 text-text-muted rounded-xl border border-border bg-surface">
              No vehicles match your filters.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <BrowseVehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </div>
  </>
  );

  if (isBuyer) {
    return content;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{content}</div>
      <LandingFooter />
    </div>
  );
}
