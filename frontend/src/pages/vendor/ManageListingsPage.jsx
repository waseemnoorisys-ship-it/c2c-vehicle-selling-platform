import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import VehicleImage from "../../components/vehicles/VehicleImage";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchVendorListings, deleteListing } from "../../api/vendor.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function ManageListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchVendorListings();
      setListings(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load your listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleDelete(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete listing");
    }
  }

  const columns = [
    {
      key: "title",
      label: "Vehicle",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-12 h-9 rounded-md overflow-hidden border border-border shrink-0 bg-background-secondary">
            <VehicleImage vehicle={r} className="w-full h-full object-cover" />
          </div>
          <span className="text-text-primary font-medium truncate">{r.title}</span>
        </div>
      ),
    },
    { key: "price", label: "Price", render: (r) => formatPrice(r.price) },
    { key: "views", label: "Views", render: (r) => r.views ?? 0 },
    { key: "offers", label: "Offers", render: (r) => r.offers ?? 0 },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate(`/vendor/listings/${r.id}/edit`)} className="text-xs text-text-accent hover:underline">Edit</button>
          <button type="button" onClick={() => handleDelete(r.id)} className="text-xs text-danger hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader
        title="Manage Listings"
        subtitle="View and manage your vehicle listings"
        action={<Button className="w-auto px-6" onClick={() => navigate("/vendor/listings/new")}>+ Add Vehicle</Button>}
      />
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted text-sm">
          Loading listings…
        </div>
      ) : (
        <DataTable columns={columns} data={listings} emptyMessage="No listings yet" />
      )}
    </SidebarLayout>
  );
}
