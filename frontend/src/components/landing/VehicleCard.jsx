export default function VehicleCard({ vehicle, compact = false }) {
  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden hover:border-primary-400/40 transition group">
      <div className="relative h-44 bg-gradient-to-br from-background-secondary to-surface-elevated flex items-center justify-center">
        <svg
          className="w-20 h-20 text-text-muted/30 group-hover:text-text-accent/40 transition"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5 11h14l-1.5 6H6.5L5 11zM7 8l1-3h8l1 3M9 14h6" />
        </svg>
        <button
          type="button"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-surface/80 border border-border text-text-muted hover:text-danger transition"
          aria-label="Add to favorites"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {compact ? (
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary text-sm leading-snug">{vehicle.title}</h3>
            <span className="text-text-accent font-bold text-sm shrink-0">{vehicle.price}</span>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-text-primary text-sm">{vehicle.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span>{vehicle.mileage}</span>
              <span>•</span>
              <span>{vehicle.transmission}</span>
              <span>•</span>
              <span>{vehicle.fuel}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-text-accent font-bold">{vehicle.price}</span>
              <span className="flex items-center gap-1 text-xs text-text-accent font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
