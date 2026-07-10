import { Link } from "react-router-dom";
import StatusBadge from "../dashboard/StatusBadge";
import VehicleImage from "./VehicleImage";

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function BrowseVehicleCard({ vehicle }) {
  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden hover:border-primary-400/40 transition group">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative h-44 bg-gradient-to-br from-background-secondary to-surface-elevated overflow-hidden">
          <VehicleImage
            vehicle={vehicle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {vehicle.verified && (
            <span className="absolute top-3 left-3 z-10">
              <StatusBadge status="approved" />
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{vehicle.title}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
          <span>{vehicle.mileage?.toLocaleString()} km</span>
          <span>•</span>
          <span>{vehicle.transmission}</span>
          <span>•</span>
          <span>{vehicle.fuel}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-text-accent font-bold">{formatPrice(vehicle.price)}</span>
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="text-xs font-semibold text-text-accent hover:underline uppercase tracking-wide"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
