import api from "./axios";
import {
  MOCK_VENDOR_LISTINGS,
  MOCK_VENDOR_OFFERS,
  MOCK_WALLET,
  MOCK_TRANSACTIONS,
  MOCK_BANK,
} from "../data/mockData";

const USE_MOCK = true;
const delay = (data, ms = 300) =>
  new Promise((r) => setTimeout(() => r({ data: { data } }), ms));

export async function fetchVendorDashboard() {
  if (USE_MOCK) {
    return delay({
      activeListings: MOCK_VENDOR_LISTINGS.filter((l) => l.status === "active").length,
      pendingOffers: MOCK_VENDOR_OFFERS.filter((o) => o.status === "pending").length,
      totalEarnings: MOCK_WALLET.totalEarnings,
      recentOffers: MOCK_VENDOR_OFFERS.slice(0, 3),
    });
  }
  return (await api.get("/vendor/dashboard")).data;
}

export async function fetchVendorListings() {
  if (USE_MOCK) return delay(MOCK_VENDOR_LISTINGS);
  return (await api.get("/vendor/listings")).data;
}

export async function fetchVendorOffers() {
  if (USE_MOCK) return delay(MOCK_VENDOR_OFFERS);
  return (await api.get("/vendor/offers")).data;
}

export async function respondToOffer(offerId, action) {
  if (USE_MOCK) return delay({ id: offerId, status: action === "accept" ? "accepted" : "rejected" });
  return (await api.patch(`/vendor/offers/${offerId}`, { action })).data;
}

export async function fetchWallet() {
  if (USE_MOCK) return delay({ wallet: MOCK_WALLET, transactions: MOCK_TRANSACTIONS });
  return (await api.get("/vendor/wallet")).data;
}

export async function requestWithdrawal(amount) {
  if (USE_MOCK) return delay({ id: `w${Date.now()}`, amount, status: "pending" });
  return (await api.post("/vendor/wallet/withdraw", { amount })).data;
}

export async function fetchBankDetails() {
  if (USE_MOCK) return delay(MOCK_BANK);
  return (await api.get("/vendor/bank")).data;
}

export async function updateBankDetails(payload) {
  if (USE_MOCK) return delay(payload);
  return (await api.put("/vendor/bank", payload)).data;
}

export async function deleteListing(id) {
  if (USE_MOCK) return delay({ id });
  return (await api.delete(`/vendor/listings/${id}`)).data;
}
