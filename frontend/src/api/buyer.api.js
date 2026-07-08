import api from "./axios";
import { fetchMe, updateProfile } from "./user.api";
import {
  wrap,
  mapOfferToBuyerRow,
  centsToEuros,
} from "./mappers";

export async function fetchBuyerOffers() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const offers = (data.data?.offers || []).map(mapOfferToBuyerRow);
  return wrap(offers);
}

export async function fetchBuyerPurchases() {
  const { data } = await api.post("/offers/mine", { page: 1, limit: 50 });
  const purchases = (data.data?.offers || [])
    .filter((o) => o.status === "accepted")
    .map((o) => {
      const row = mapOfferToBuyerRow(o);
      return {
        id: row.id,
        vehicleTitle: row.vehicleTitle,
        amount: row.amount,
        date: row.createdAt,
        status: "completed",
        invoiceId: "—",
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
