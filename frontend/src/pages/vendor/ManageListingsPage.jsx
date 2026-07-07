import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchVendorListings, deleteListing } from "../../api/vendor.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function ManageListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchVendorListings().then((res) => setListings(res.data.data));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this listing?")) return;
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing deleted");
  }

  const columns = [
    { key: "title", label: "Vehicle" },
    { key: "price", label: "Price", render: (r) => formatPrice(r.price) },
    { key: "views", label: "Views" },
    { key: "offers", label: "Offers" },
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
      <DataTable columns={columns} data={listings} emptyMessage="No listings yet" />
    </SidebarLayout>
  );
}
