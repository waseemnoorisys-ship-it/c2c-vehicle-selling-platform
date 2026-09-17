import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import VehicleImage from "../../components/vehicles/VehicleImage";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchAdminListings, approveListing, deleteAdminListing } from "../../api/admin.api";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function AdminListingsPage() {
  const { formatPrice } = useCurrencyStore();
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchAdminListings().then((res) => setListings(res.data.data || []));
  }, []);

  async function handleApproval(id, action) {
    try {
      await approveListing(id, action);
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, approvalStatus: action, status: action === "approved" ? "active" : "rejected" }
            : l
        )
      );
      if (selectedListing && selectedListing.id === id) {
        setSelectedListing((prev) => ({
          ...prev,
          approvalStatus: action,
          status: action === "approved" ? "active" : "rejected",
        }));
      }
      toast.success(`Listing ${action}`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} listing`);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try {
      await deleteAdminListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      if (selectedListing && selectedListing.id === id) {
        setSelectedListing(null);
      }
      toast.success("Listing deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete listing");
    }
  }

  const columns = [
    {
      key: "title",
      label: "Vehicle",
      render: (r) => (
        <button
          type="button"
          onClick={() => setSelectedListing(r)}
          className="text-left font-medium text-text-accent hover:underline flex items-center gap-1.5 cursor-pointer"
          title="Click to view details modal"
        >
          <span>🚗</span>
          <span>{r.title}</span>
        </button>
      ),
    },
    { key: "sellerName", label: "Seller" },
    { key: "price", label: "Price", render: (r) => formatPrice(r.price) },
    { key: "submittedAt", label: "Submitted" },
    { key: "approvalStatus", label: "Status", render: (r) => <StatusBadge status={r.approvalStatus} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            className="w-auto py-1 px-2.5 text-xs normal-case text-cyan-400 font-medium hover:bg-cyan-500/10"
            onClick={() => setSelectedListing(r)}
          >
            👁️ View
          </Button>

          {r.approvalStatus === "pending" && (
            <>
              <Button
                variant="ghost"
                className="w-auto py-1 px-2.5 text-xs normal-case text-success font-medium hover:bg-success/10"
                onClick={() => handleApproval(r.id, "approved")}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                className="w-auto py-1 px-2.5 text-xs normal-case text-amber-500 font-medium hover:bg-amber-500/10"
                onClick={() => handleApproval(r.id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            className="w-auto py-1 px-2.5 text-xs normal-case text-danger font-medium hover:bg-danger/10"
            onClick={() => handleDelete(r.id)}
          >
            🗑️ Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader
        title="Vehicle Listings"
        subtitle="View, approve, reject, or delete spam vehicle listings"
      />
      <DataTable columns={columns} data={listings} />

      {/* Vehicle Details Modal Popup */}
      {selectedListing &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#182229] border border-gray-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#202c33] border-b border-gray-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-gray-100 font-bold text-lg">
                    {selectedListing.title}
                  </h3>
                  <StatusBadge status={selectedListing.approvalStatus} />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Image Banner */}
                <div className="h-56 w-full rounded-xl bg-gray-900 border border-gray-800 overflow-hidden relative">
                  <VehicleImage vehicle={selectedListing} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-emerald-400 font-bold text-sm border border-emerald-500/30">
                    {formatPrice(selectedListing.price)}
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Seller</span>
                    <span className="text-xs font-semibold text-gray-200 truncate block mt-0.5">
                      {selectedListing.sellerName}
                    </span>
                    {selectedListing.sellerEmail && (
                      <span className="text-[10px] text-gray-400 truncate block">
                        {selectedListing.sellerEmail}
                      </span>
                    )}
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Asking Price</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">
                      {formatPrice(selectedListing.askingPrice || selectedListing.price)}
                    </span>
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Year</span>
                    <span className="text-xs font-semibold text-gray-200 mt-0.5 block">
                      {selectedListing.year || "—"}
                    </span>
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Mileage</span>
                    <span className="text-xs font-semibold text-gray-200 mt-0.5 block">
                      {selectedListing.mileage ? `${Number(selectedListing.mileage).toLocaleString()} km` : "—"}
                    </span>
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Fuel Type</span>
                    <span className="text-xs font-semibold text-gray-200 mt-0.5 block capitalize">
                      {selectedListing.fuelType || "—"}
                    </span>
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Transmission</span>
                    <span className="text-xs font-semibold text-gray-200 mt-0.5 block capitalize">
                      {selectedListing.transmission || "—"}
                    </span>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="bg-[#202c33] p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-700/50 pb-2">
                    <span className="text-gray-400">Registration Number</span>
                    <span className="text-gray-200 font-mono font-medium">{selectedListing.registrationNumber || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700/50 pb-2">
                    <span className="text-gray-400">Location</span>
                    <span className="text-gray-200 font-medium">{selectedListing.locationText || "—"}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-400">Date Submitted</span>
                    <span className="text-gray-200 font-medium">{selectedListing.submittedAt}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedListing.description && (
                  <div className="bg-[#202c33] p-4 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-400 font-semibold block mb-1">Description</span>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedListing.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-[#202c33] border-t border-gray-700/80 flex items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  className="w-auto px-4 py-2 text-xs normal-case border-gray-700 text-gray-300"
                  onClick={() => setSelectedListing(null)}
                >
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  {selectedListing.approvalStatus === "pending" && (
                    <>
                      <Button
                        className="w-auto px-4 py-2 text-xs normal-case bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        onClick={() => handleApproval(selectedListing.id, "approved")}
                      >
                        ✓ Approve Listing
                      </Button>
                      <Button
                        className="w-auto px-4 py-2 text-xs normal-case bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                        onClick={() => handleApproval(selectedListing.id, "rejected")}
                      >
                        ✕ Reject Listing
                      </Button>
                    </>
                  )}

                  <Button
                    className="w-auto px-4 py-2 text-xs normal-case bg-red-600 hover:bg-red-500 text-white font-semibold"
                    onClick={() => handleDelete(selectedListing.id)}
                  >
                    🗑️ Delete Listing
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </SidebarLayout>
  );
}
