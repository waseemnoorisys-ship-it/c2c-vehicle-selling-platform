import api from "./axios";
import { fetchMe, updateProfile } from "./user.api";
import {
  wrap,
  mapOfferToBuyerRow,
  centsToEuros,
} from "./mappers";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


export async function fetchBuyerOffers() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const offers = (data.data?.offers || []).map(mapOfferToBuyerRow);
  return wrap(offers);
}

export async function fetchAcceptedOffers() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const offers = (data.data?.offers || [])
    .filter((o) => o.status === "accepted")
    .map((o) => ({
      ...mapOfferToBuyerRow(o),
      _id: o._id,
      listingId: o.listingId,         // keep raw listing for vehicleId
      amountCents: o.amount,          // raw cents for payment
    }));
  return wrap(offers);
}



export async function fetchBuyerInvoice(transactionId) {
  try {
    const res = await api.post("/wallet/invoices/get", { transactionId });
    return res.data?.data?.invoice || null;
  } catch {
    return null;
  }
}

export async function fetchBuyerPurchases() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const purchases = (data.data?.offers || [])
    .filter((o) => o.status === "accepted")
    .map((o) => {
      const row = mapOfferToBuyerRow(o);
      const listing = o.listingId || {};
      const buyer = o.buyerId || {};
      const year = listing.year || "";
      const make = listing.makeId?.name || listing.make || "";
      const model = listing.modelId?.name || listing.model || "";
      const invoiceId = `INV-${new Date(o.createdAt || Date.now()).getFullYear()}-${(o._id || o.id || "000000").slice(-6).toUpperCase()}`;

      let sellerName = "Verified Private Vendor";
      if (listing.vendorId) {
        if (typeof listing.vendorId === "object") {
          sellerName = `${listing.vendorId.firstName || ""} ${listing.vendorId.lastName || ""}`.trim() || listing.vendorId.email || sellerName;
        }
      }

      return {
        id: row.id,
        offerId: o._id,
        vehicleTitle: row.vehicleTitle,
        vehicleImage: listing.coverPhoto || null,
        make,
        model,
        year,
        location: listing.locationText || "Europe",
        amount: row.amount,
        amountCents: o.amount,
        date: row.createdAt,
        rawDate: o.createdAt || o.updatedAt,
        status: "Completed",
        invoiceId,
        sellerName,
        sellerEmail: typeof listing.vendorId === "object" ? listing.vendorId?.email : "seller@c2cplatform.com",
        buyerName: typeof buyer === "object" && buyer.firstName ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() : "Verified Buyer",
        buyerEmail: typeof buyer === "object" ? buyer.email : "buyer@c2cplatform.com",
        transactionId: o.transactionId || o._id,
      };
    });
  return wrap(purchases);
}

export async function fetchBuyerPayments() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const payments = (data.data?.offers || [])
    .filter((o) => ["accepted", "pending"].includes(o.status))
    .map((o) => ({
      id: o._id,
      description: "Vehicle offer",
      amount: centsToEuros(o.amount),
      date: formatDate(o.createdAt),
      status: o.status === "accepted" ? "paid" : "pending",
      method: "Escrow",
    }));
  return wrap(payments);
}

export async function updateBuyerProfile(payload) {
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
  };
  if (payload.phone) {
    const digits = payload.phone.replace(/\D/g, "");
    body.mobile = digits.slice(-15);
    if (payload.phone.trim().startsWith("+")) {
      body.countryCode = payload.phone.trim().split(/\s+/)[0];
    }
  }
  const res = await updateProfile(body);
  return wrap(res.data);
}

export async function fetchBuyerProfile() {
  const res = await fetchMe();
  return wrap(res.data);
}

export async function fetchBuyerDashboard() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const offers = data.data?.offers || [];
  const accepted = offers.filter((o) => o.status === "accepted");
  const pending = offers.filter((o) => o.status === "pending");

  return wrap({
    totalPurchases: accepted.length,
    totalSpent: accepted.reduce((s, o) => s + centsToEuros(o.amount), 0),
    activeOffers: pending.length,
    recentPurchases: accepted.slice(0, 5).map((o) => {
      const row = mapOfferToBuyerRow(o);
      return {
        vehicleTitle: row.vehicleTitle,
        amount: row.amount,
        date: row.createdAt,
        status: "completed",
      };
    }),
  });
}
