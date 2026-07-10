import { Link } from "react-router-dom";
import VehicleImage from "../vehicles/VehicleImage";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatMileage(mileage) {
  if (mileage == null || mileage === "") return "—";
  const value = Number(mileage);
  if (Number.isNaN(value)) return String(mileage);
  return `${value.toLocaleString()} km`;
}

export default function VehicleCard({ vehicle, compact = false }) {
  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden hover:border-primary-400/40 transition group">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative h-44 bg-gradient-to-br from-background-secondary to-surface-elevated overflow-hidden">
          <VehicleImage
            vehicle={vehicle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4">
        {compact ? (
          <div className="flex items-start justify-between gap-2">
            <Link to={`/vehicles/${vehicle.id}`} className="hover:text-text-accent transition">
              <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">{vehicle.title}</h3>
            </Link>
            <span className="text-text-accent font-bold text-sm shrink-0">{formatPrice(vehicle.price)}</span>
          </div>
        ) : (
          <>
            <Link to={`/vehicles/${vehicle.id}`} className="hover:text-text-accent transition">
              <h3 className="font-semibold text-text-primary text-sm line-clamp-2">{vehicle.title}</h3>
            </Link>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span>{formatMileage(vehicle.mileage)}</span>
              <span>•</span>
              <span>{vehicle.transmission || "—"}</span>
              <span>•</span>
              <span>{vehicle.fuel || "—"}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-text-accent font-bold">{formatPrice(vehicle.price)}</span>
              {vehicle.verified && (
                <span className="flex items-center gap-1 text-xs text-text-accent font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
