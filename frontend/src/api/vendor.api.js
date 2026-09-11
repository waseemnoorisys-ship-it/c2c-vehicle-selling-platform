import api from "./axios";
import {
  wrap,
  mapListingToVehicle,
  mapOfferToVendorRow,
  mapWalletResponse,
  mapLedgerEntry,
  eurosToCents,
} from "./mappers";

const VENDOR_LISTINGS_PAGE_SIZE = 50;

export async function fetchVendorDashboard() {
  const [listingsRes, offersRes, walletRes] = await Promise.all([
    api.post("/listings/mine", { page: 1, limit: VENDOR_LISTINGS_PAGE_SIZE }),
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
  const { data } = await api.post("/listings/mine", { page: 1, limit: VENDOR_LISTINGS_PAGE_SIZE });
  const listings = (data.data?.listings || []).map(mapListingToVehicle);
  return wrap(listings);
}

export async function fetchVendorListingById(id) {
  const { data } = await api.post("/listings/mine", { page: 1, limit: VENDOR_LISTINGS_PAGE_SIZE });
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
  const rawRouting = payload.swift || payload.ifscOrRouting || "NONE";
  const ifscOrRouting = rawRouting.trim().length < 4 ? rawRouting.trim().padEnd(4, "X") : rawRouting.trim();
  const { data } = await api.post("/wallet/bank-details/create", {
    accountHolderName: payload.accountName,
    bankName: payload.bankName,
    accountNumber: payload.iban?.replace(/\s/g, "") || payload.accountNumber,
    ifscOrRouting,
  });
  return data;
}

export async function deleteListing(id) {
  const { data } = await api.post("/listings/delete", { id });
  return data;
}

export async function fetchVendorSales() {
  try {
    const { data } = await api.post("/offers/received", { page: 1, limit: 50 });
    const offers = data.data?.offers || [];
    const sales = offers
      .filter((o) => o.status === "accepted" || o.status === "completed" || o.listingId?.status === "sold")
      .map((o) => {
        const year = o.listingId?.year || "";
        const make = o.listingId?.makeId?.name || o.listingId?.make || "";
        const model = o.listingId?.modelId?.name || o.listingId?.model || "";
        const title = `${year} ${make} ${model}`.trim() || "Vehicle";
        const buyerName = o.buyerId ? `${o.buyerId.firstName || ""} ${o.buyerId.lastName || ""}`.trim() : "Verified Buyer";
        const invoiceId = `INV-${new Date(o.createdAt || Date.now()).getFullYear()}-${(o._id || "000000").slice(-6).toUpperCase()}`;

        return {
          id: o._id,
          transactionId: o.transactionId || o._id,
          offerId: o._id,
          vehicleTitle: title,
          amount: (o.amount || 0) / 100,
          date: new Date(o.createdAt || Date.now()).toISOString().split("T")[0],
          status: "completed",
          buyerName,
          buyerEmail: o.buyerId?.email || "buyer@c2cplatform.com",
          sellerName: "Vendor / You",
          invoiceId,
        };
      });
    return wrap(sales);
  } catch (err) {
    console.error("fetchVendorSales error:", err);
    return wrap([]);
  }
}
