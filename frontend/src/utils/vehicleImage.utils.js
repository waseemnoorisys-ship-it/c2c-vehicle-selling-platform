const BRAND_THEMES = {
  bmw: { from: "#1c69d4", to: "#0b1d39", accent: "#ffffff" },
  mercedes: { from: "#00a19c", to: "#0f1419", accent: "#ffffff" },
  "mercedes-benz": { from: "#00a19c", to: "#0f1419", accent: "#ffffff" },
  audi: { from: "#bb0a30", to: "#111111", accent: "#ffffff" },
  toyota: { from: "#eb0a1e", to: "#141414", accent: "#ffffff" },
  honda: { from: "#cc0000", to: "#161616", accent: "#ffffff" },
  ford: { from: "#003478", to: "#101820", accent: "#ffffff" },
  porsche: { from: "#b12b28", to: "#1a1a1a", accent: "#f5f5f5" },
  tata: { from: "#1e4da1", to: "#0d1b2a", accent: "#ffffff" },
  mahindra: { from: "#c62828", to: "#1b1b1b", accent: "#ffffff" },
  hero: { from: "#e31937", to: "#171717", accent: "#ffffff" },
  hyundai: { from: "#002c5f", to: "#111827", accent: "#ffffff" },
  kia: { from: "#05141f", to: "#bb162b", accent: "#ffffff" },
  volkswagen: { from: "#001e50", to: "#111111", accent: "#ffffff" },
  nissan: { from: "#c3002f", to: "#141414", accent: "#ffffff" },
  byd: { from: "#1d4ed8", to: "#0f172a", accent: "#ffffff" },
};

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getBrandTheme(make = "") {
  const key = make.toLowerCase().trim();
  if (BRAND_THEMES[key]) return BRAND_THEMES[key];

  const hash = hashString(key || "vehicle");
  const hue = hash % 360;
  return {
    from: `hsl(${hue} 42% 32%)`,
    to: `hsl(${(hue + 35) % 360} 48% 16%)`,
    accent: "#ecfeff",
  };
}

function getVehicleLabels(vehicle = {}) {
  const make = (vehicle.make || "").trim();
  const model = (vehicle.model || "").trim();
  const year = vehicle.year ? String(vehicle.year) : "";

  if (make || model) {
    return { make: make || "Vehicle", model, year };
  }

  const parts = (vehicle.title || "Vehicle").trim().split(/\s+/);
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0])) {
    return {
      make: parts[1] || "Vehicle",
      model: parts.slice(2).join(" "),
      year: parts[0],
    };
  }

  return {
    make: parts[0] || "Vehicle",
    model: parts.slice(1).join(" "),
    year,
  };
}

export function getVehiclePlaceholderUrl(vehicle) {
  const { make, model, year } = getVehicleLabels(vehicle);
  const theme = getBrandTheme(make);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.from}" />
          <stop offset="100%" stop-color="${theme.to}" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#bg)" />
      <circle cx="680" cy="90" r="120" fill="${theme.accent}" opacity="0.06" />
      <circle cx="120" cy="420" r="90" fill="${theme.accent}" opacity="0.05" />
      <g transform="translate(250 255) scale(9)" fill="${theme.accent}" opacity="0.18">
        <path d="M5 11h14l-1.5 6H6.5L5 11zM7 8l1-3h8l1 3M9 14h6" />
      </g>
      <text x="400" y="150" text-anchor="middle" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700">
        ${escapeXml(make)}
      </text>
      <text x="400" y="215" text-anchor="middle" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="34" opacity="0.92">
        ${escapeXml(model || "Model")}
      </text>
      ${
        year
          ? `<text x="400" y="265" text-anchor="middle" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="24" opacity="0.75">${escapeXml(year)}</text>`
          : ""
      }
      <text x="400" y="455" text-anchor="middle" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="18" opacity="0.55">
        Photo coming soon
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getVehicleDisplayImage(vehicle, usePlaceholder = true) {
  const realUrl =
    vehicle?.coverPhoto ||
    (Array.isArray(vehicle?.images) && vehicle.images[0]) ||
    (Array.isArray(vehicle?.photos) && (vehicle.photos[0]?.url || vehicle.photos[0])) ||
    null;

  if (realUrl) return realUrl;
  return usePlaceholder ? getVehiclePlaceholderUrl(vehicle) : null;
}
