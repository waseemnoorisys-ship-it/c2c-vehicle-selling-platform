import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import { toggleFavoriteApi } from "../../api/user.api";

export default function FavoriteButton({ vehicleId, className = "", variant = "icon" }) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Check if saved
  const savedList = user?.savedVehicles || [];
  const isSaved = savedList.some((id) => {
    const rawId = typeof id === "object" && id !== null ? id._id || id.id : id;
    return String(rawId) === String(vehicleId);
  });

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save vehicles to your wishlist.");
      return;
    }

    setLoading(true);
    try {
      const res = await toggleFavoriteApi(vehicleId);
      const updatedSaved = res.data?.savedVehicles || [];
      const newSavedState = res.data?.isSaved;

      setUser({ ...user, savedVehicles: updatedSaved });

      if (newSavedState) {
        toast.success("Saved to your wishlist! ❤️");
      } else {
        toast.success("Removed from your wishlist.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
          isSaved
            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "border-border bg-surface text-text-primary hover:bg-surface-hover"
        } ${className}`}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isSaved ? "fill-red-500 text-red-500 scale-110" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
          />
        </svg>
        <span>{isSaved ? "Saved to Wishlist" : "Save to Wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
      className={`w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center transition cursor-pointer hover:scale-110 ${
        isSaved ? "text-red-500 border-red-500/50" : "text-text-muted hover:text-red-400"
      } ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-transform ${isSaved ? "fill-red-500 text-red-500" : "fill-none stroke-current"}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    </button>
  );
}
