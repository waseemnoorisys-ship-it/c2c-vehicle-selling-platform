/** Shared response wrapper — pages expect res.data.data */
export function wrap(data) {
  return { data: { data } };
}

export function centsToEuros(cents) {
  return (cents ?? 0) / 100;
}

export function eurosToCents(euros) {
  return Math.round(Number(euros) * 100);
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().split("T")[0];
}

const FUEL_TO_BACKEND = {
  petrol: "petrol",
  diesel: "diesel",
  electric: "electric",
  hybrid: "hybrid",
  gas: "gas",
  Petrol: "petrol",
  Diesel: "diesel",
  Electric: "electric",
  Hybrid: "hybrid",
};

const FUEL_TO_DISPLAY = {
  petrol: "Petrol",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  gas: "Gas",
  hydrogen: "Hydrogen",
};

const TRANSMISSION_TO_BACKEND = {
  manual: "manual",
  automatic: "automatic",
  "semi-automatic": "semi-automatic",
  Manual: "manual",
  Automatic: "automatic",
};

const TRANSMISSION_TO_DISPLAY = {
  manual: "Manual",
  automatic: "Automatic",
  "semi-automatic": "Semi-Automatic",
};

export function toBackendFuel(value) {
  if (!value) return undefined;
  return FUEL_TO_BACKEND[value] || value.toLowerCase();
}

export function toDisplayFuel(value) {
  if (!value) return "—";
  return FUEL_TO_DISPLAY[value] || value;
}

export function toBackendTransmission(value) {
  if (!value) return undefined;
  return TRANSMISSION_TO_BACKEND[value] || value.toLowerCase();
}

export function toDisplayTransmission(value) {
  if (!value) return "—";
  return TRANSMISSION_TO_DISPLAY[value] || value;
}

export function listingTitle(listing) {
  const make = listing.makeId?.name || listing.make || "";
  const model = listing.modelId?.name || listing.model || "";
  const year = listing.year || "";
  return `${year} ${make} ${model}`.trim() || "Vehicle";
}

export function getListingImageUrl(listing) {
  if (!listing) return null;
  if (listing.coverPhoto) return listing.coverPhoto;
  const photos = listing.photos || listing.images;
  if (!Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

export function getListingCoordinates(listing) {
  const coords = listing?.location?.coordinates;
  const longitude = listing?.longitude ?? coords?.[0];
  const latitude = listing?.latitude ?? coords?.[1];

  const hasValidCoords =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    !(Number(latitude) === 0 && Number(longitude) === 0);

  return hasValidCoords
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : { latitude: null, longitude: null };
}

export function mapListingToVehicle(listing) {
  if (!listing) return null;
  const id = listing._id || listing.id;
  const coverPhoto = getListingImageUrl(listing);
  const { latitude, longitude } = getListingCoordinates(listing);

  let sellerName = "";
  if (typeof listing.vendorId === "object" && listing.vendorId !== null) {
    sellerName = `${listing.vendorId.firstName || ""} ${listing.vendorId.lastName || ""}`.trim();
  }
  if (!sellerName) {
    sellerName = listing.sellerName || listing.vendorName || "Verified Seller";
  }

  return {
    id,
    _id: id,
    title: listingTitle(listing),
    make: listing.makeId?.name || listing.make || "",
    model: listing.modelId?.name || listing.model || "",
    makeId: listing.makeId?._id || listing.makeId,
    modelId: listing.modelId?._id || listing.modelId,
    year: listing.year,
    price: centsToEuros(listing.displayPrice),
    displayPrice: listing.displayPrice,
    askingPrice: listing.askingPrice,
    mileage: listing.mileage,
    fuel: toDisplayFuel(listing.fuelType),
    fuelType: listing.fuelType,
    transmission: toDisplayTransmission(listing.transmission),
    bodyType: listing.bodyType || "",
    location: listing.locationText || "",
    locationText: listing.locationText || "",
    latitude,
    longitude,
    verified: Boolean(listing.isVerified),
    status: listing.status === "approved" ? "active" : listing.status,
    vendorId: listing.vendorId,
    sellerId: typeof listing.vendorId === "object" ? listing.vendorId?._id : listing.vendorId,
    sellerName: sellerName,
    description: listing.description || "",
    specs: listing.specs || {},
    images: listing.photos?.map((p) => p.url || p) || [],
    coverPhoto,
    photos: listing.photos || [],
    views: listing.viewCount ?? 0,
    offers: listing.offerCount ?? 0,
    createdAt: formatDate(listing.createdAt),
  };
}

export function mapOfferToBuyerRow(offer) {
  const listing = offer.listingId;
  return {
    id: offer._id,
    vehicleId: listing?._id || offer.listingId,
    vehicleTitle: listing ? listingTitle(listing) : "Vehicle",
    amount: centsToEuros(offer.amount),
    status: offer.status,
    createdAt: formatDate(offer.createdAt),
    buyerId: offer.buyerId?._id || offer.buyerId,
  };
}

export function mapOfferToVendorRow(offer) {
  const listing = offer.listingId;
  const buyer = offer.buyerId;
  return {
    id: offer._id,
    vehicleId: listing?._id || offer.listingId,
    vehicleTitle: listing ? listingTitle(listing) : "Vehicle",
    buyerName: buyer?.firstName
      ? `${buyer.firstName}${buyer.lastName ? ` ${buyer.lastName}` : ""}`
      : "Buyer",
    amount: centsToEuros(offer.amount),
    status: offer.status,
    createdAt: formatDate(offer.createdAt),
  };
}

export function mapUserToAdminRow(user, extras = {}) {
  return {
    id: user._id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    email: user.email,
    phone: user.mobile ? `${user.countryCode || ""} ${user.mobile}`.trim() : "—",
    status: user.isActive ? "active" : "inactive",
    joined: formatDate(user.createdAt),
    purchases: extras.purchases ?? 0,
    listings: extras.listings ?? 0,
    sales: extras.sales ?? 0,
  };
}

export function mapAdminListingRow(listing) {
  const vendor = listing.vendorId;
  return {
    id: listing._id,
    title: listingTitle(listing),
    sellerName: vendor
      ? `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim()
      : "—",
    price: centsToEuros(listing.displayPrice),
    submittedAt: formatDate(listing.createdAt),
    approvalStatus:
      listing.status === "pending"
        ? "pending"
        : listing.status === "approved"
          ? "approved"
          : listing.status === "rejected"
            ? "rejected"
            : listing.status,
    status: listing.status === "approved" ? "active" : listing.status,
  };
}

export function mapWithdrawalRow(w) {
  const user = w.userId;
  const bank = w.bankDetailsId;
  const status =
    w.status === "paid"
      ? "completed"
      : w.status === "approved"
        ? "pending"
        : w.status;
  return {
    id: w._id,
    seller: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "—",
    amount: centsToEuros(w.amount),
    bank: bank?.bankName || "—",
    date: formatDate(w.createdAt),
    status,
  };
}

export function mapLedgerEntry(entry) {
  const signed =
    entry.type === "debit" ? -centsToEuros(entry.amount) : centsToEuros(entry.amount);
  return {
    id: entry._id,
    type: entry.type,
    description: entry.description,
    amount: signed,
    date: formatDate(entry.createdAt),
    status: "completed",
  };
}

export function mapWalletResponse(wallet, ledgerEntries = []) {
  const credits = ledgerEntries
    .filter((e) => e.type === "credit")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  return {
    balance: centsToEuros(wallet?.balance),
    pending: 0,
    totalEarnings: centsToEuros(credits || wallet?.balance),
    currency: (wallet?.currency || "eur").toUpperCase(),
  };
}
