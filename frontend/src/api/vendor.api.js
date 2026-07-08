import api from "./axios";
import {
  wrap,
  mapListingToVehicle,
  mapOfferToVendorRow,
  mapWalletResponse,
  mapLedgerEntry,
  eurosToCents,
} from "./mappers";

export async function fetchVendorDashboard() {
  const [listingsRes, offersRes, walletRes] = await Promise.all([
    api.post("/listings/mine", { page: 1, limit: 100 }),
    api.post("/offers/received", { page: 1, limit: 50 }),
    api.post("/wallet/get"),
  ]);

  const listings = listingsRes.data.data?.listings || [];
  const offers = offersRes.data.data?.offers || [];
  const wallet = walletRes.data.data?.wallet;

  const activeListings = listings.filter((l) => l.status === "approved").length;
  const pendingOffers = offers.filter((o) => o.status === "pending").length;
  const recentOffers = offers.slice(0, 3).map(mapOfferToVendorRow);

  return wrap({
    activeListings,
    pendingOffers,
    totalEarnings: (wallet?.balance ?? 0) / 100,
    recentOffers,
  });
}

export async function fetchVendorListings() {
  const { data } = await api.post("/listings/mine", { page: 1, limit: 100 });
  const listings = (data.data?.listings || []).map(mapListingToVehicle);
  return wrap(listings);
}

export async function fetchVendorListingById(id) {
  const { data } = await api.post("/listings/mine", { page: 1, limit: 100 });
  const listing = (data.data?.listings || []).find((l) => l._id === id);
  if (!listing) throw new Error("Listing not found");
  return wrap(mapListingToVehicle(listing));
}

export async function fetchVendorOffers() {
  const { data } = await api.post("/offers/received", { page: 1, limit: 50 });
  const offers = (data.data?.offers || []).map(mapOfferToVendorRow);
  return wrap(offers);
}

export async function respondToOffer(offerId, action) {
  if (action === "accept") {
    const { data } = await api.post("/offers/accept", { id: offerId });
    return data;
  }
  const { data } = await api.post("/offers/reject", { id: offerId });
  return data;
}

export async function fetchWallet() {
  const [walletRes, ledgerRes] = await Promise.all([
    api.post("/wallet/get"),
    api.post("/wallet/ledger", { page: 1, limit: 50 }),
  ]);

  const wallet = walletRes.data.data?.wallet;
  const entries = ledgerRes.data.data?.entries || [];
  const transactions = entries.map(mapLedgerEntry);

  return wrap({
    wallet: mapWalletResponse(wallet, entries),
    transactions,
  });
}

export async function requestWithdrawal(amountEuros) {
  const { data } = await api.post("/wallet/withdrawals/create", {
    amount: eurosToCents(amountEuros),
  });
  return data;
}

export async function fetchBankDetails() {
  try {
    const { data } = await api.post("/wallet/bank-details/get");
    const bd = data.data?.bankDetails;
    return wrap({
      accountName: bd?.accountHolderName || "",
      bankName: bd?.bankName || "",
      iban: bd?.accountNumberMasked || "",
      swift: "",
      country: "",
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return wrap({
        accountName: "",
        bankName: "",
        iban: "",
        swift: "",
        country: "",
      });
    }
    throw err;
  }
}

export async function updateBankDetails(payload) {
  const { data } = await api.post("/wallet/bank-details/create", {
    accountHolderName: payload.accountName,
    bankName: payload.bankName,
    accountNumber: payload.iban?.replace(/\s/g, "") || payload.accountNumber,
    ifscOrRouting: payload.swift || payload.ifscOrRouting || "NA",
  });
  return data;
}

export async function deleteListing(id) {
  const { data } = await api.post("/listings/delete", { id });
  return data;
}
