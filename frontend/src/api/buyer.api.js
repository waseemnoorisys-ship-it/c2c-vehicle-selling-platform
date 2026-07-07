import api from "./axios";
import { MOCK_OFFERS, MOCK_PURCHASES, MOCK_PAYMENTS } from "../data/mockData";

const USE_MOCK = true;
const delay = (data, ms = 300) =>
  new Promise((r) => setTimeout(() => r({ data: { data } }), ms));

export async function fetchBuyerOffers() {
  if (USE_MOCK) return delay(MOCK_OFFERS);
  return (await api.get("/buyer/offers")).data;
}

export async function fetchBuyerPurchases() {
  if (USE_MOCK) return delay(MOCK_PURCHASES);
  return (await api.get("/buyer/purchases")).data;
}

export async function fetchBuyerPayments() {
  if (USE_MOCK) return delay(MOCK_PAYMENTS);
  return (await api.get("/buyer/payments")).data;
}

export async function updateBuyerProfile(payload) {
  if (USE_MOCK) return delay(payload);
  return (await api.put("/buyer/profile", payload)).data;
}

export async function fetchBuyerDashboard() {
  if (USE_MOCK) {
    return delay({
      totalPurchases: MOCK_PURCHASES.length,
      totalSpent: MOCK_PURCHASES.reduce((s, p) => s + p.amount, 0),
      activeOffers: MOCK_OFFERS.filter((o) => o.status === "pending").length,
      recentPurchases: MOCK_PURCHASES,
    });
  }
  return (await api.get("/buyer/dashboard")).data;
}
