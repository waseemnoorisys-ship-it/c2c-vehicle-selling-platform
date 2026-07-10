function buildMapsEmbedUrl({ locationText, latitude, longitude }) {
  const query =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : locationText?.trim();

  if (!query) return null;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
}

function buildMapsLinkUrl({ locationText, latitude, longitude }) {
  const query =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : locationText?.trim();

  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function ListingLocationMap({
  locationText = "",
  latitude = null,
  longitude = null,
  className = "h-48",
}) {
  const embedUrl = buildMapsEmbedUrl({ locationText, latitude, longitude });
  const mapsLink = buildMapsLinkUrl({ locationText, latitude, longitude });
  const address = locationText?.trim();

  if (!embedUrl) {
    return (
      <div className={`rounded-lg bg-background-secondary border border-border flex items-center justify-center text-text-muted text-sm ${className}`}>
        Location not available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {address && (
        <p className="text-sm text-text-secondary flex items-start gap-2">
          <span aria-hidden>📍</span>
          <span>{address}</span>
        </p>
      )}
      <div className={`rounded-lg overflow-hidden border border-border bg-background-secondary ${className}`}>
        <iframe
          title={address ? `Map showing ${address}` : "Vehicle location map"}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {mapsLink && (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-text-accent hover:underline"
        >
          Open in Google Maps →
        </a>
      )}
    </div>
  );
}
