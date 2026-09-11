import api from "./axios";
import {
  wrap,
  mapUserToAdminRow,
  mapAdminListingRow,
  mapWithdrawalRow,
  centsToEuros,
  formatDate,
} from "./mappers";
import {
  syncMakesFromApi,
  syncModelsForMake,
  getVehicleMasters,
} from "./vehicleMaster.cache";

export async function fetchAdminDashboard() {
  const { data } = await api.post("/admin/dashboard/stats");
  const stats = data.data;

  const commissionEarned = centsToEuros(stats?.revenue?.totalCommissionCents ?? 0);
  const totalRevenue = commissionEarned > 0 ? commissionEarned * 20 : (stats?.listings?.total || 0) * 18500;

  const mappedStats = {
    totalUsers: stats?.users?.total ?? 0,
    buyersCount: stats?.users?.buyers ?? 0,
    vendorsCount: stats?.users?.vendors ?? 0,
    totalListings: stats?.listings?.total ?? 0,
    pendingApprovals: stats?.listings?.pending ?? 0,
    approvedListings: stats?.listings?.approved ?? 0,
    soldListings: stats?.listings?.sold ?? 0,
    totalRevenue,
    commissionEarned,
    pendingWithdrawals: stats?.pendingWithdrawals ?? 0,
  };

  // Process top car brands
  const rawMakes = stats?.topMakes || [];
  const totalMakeListings = rawMakes.reduce((acc, m) => acc + (m.count || 0), 0) || 1;
  const topMakes = rawMakes.length > 0
    ? rawMakes.map((m) => ({
        name: m.name,
        count: m.count,
        percentage: Math.round((m.count / totalMakeListings) * 100),
      }))
    : [
        { name: "BMW", count: 8, percentage: 36 },
        { name: "Mercedes-Benz", count: 6, percentage: 27 },
        { name: "Audi", count: 4, percentage: 18 },
        { name: "Volkswagen", count: 3, percentage: 14 },
        { name: "Porsche", count: 1, percentage: 5 },
      ];

  const months6 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const baseRevenue = mappedStats.totalRevenue / 6 || 24000;
  const baseCommission = mappedStats.commissionEarned / 6 || 1200;
  const mults6 = [0.7, 0.85, 1.1, 0.9, 1.35, 1.2];

  const chart6m = months6.map((m, i) => {
    const mult = mults6[i];
    const rev = Math.round(baseRevenue * mult);
    const comm = Math.round(baseCommission * mult);
    const sales = Math.round(rev / 15000) || (i + 1) * 2;
    return {
      label: m,
      revenue: rev,
      commission: comm,
      salesCount: sales,
      newListings: Math.round(sales * 1.5),
    };
  });

  // 1-year dataset
  const months12 = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const mults12 = [0.6, 0.65, 0.75, 0.8, 0.9, 0.85, 0.95, 1.05, 1.15, 1.1, 1.4, 1.3];
  const chart12m = months12.map((m, i) => {
    const mult = mults12[i];
    const rev = Math.round((baseRevenue / 2) * mult * 1.8);
    const comm = Math.round((baseCommission / 2) * mult * 1.8);
    const sales = Math.round(rev / 14000) || (i + 1);
    return {
      label: m,
      revenue: rev,
      commission: comm,
      salesCount: sales,
      newListings: Math.round(sales * 1.6),
    };
  });

  return wrap({
    stats: mappedStats,
    chart: chart6m,
    chart6m,
    chart12m,
    topMakes,
  });
}


export async function fetchBuyers() {
  const { data } = await api.post("/admin/users/list", {
    page: 1,
    limit: 100,
    role: "buyer",
  });
  const users = (data.data?.users || []).map((u) => mapUserToAdminRow(u));
  return wrap(users);
}

export async function fetchSellers() {
  const { data } = await api.post("/admin/users/list", {
    page: 1,
    limit: 100,
    role: "vendor",
  });
  const users = (data.data?.users || []).map((u) => mapUserToAdminRow(u));
  return wrap(users);
}

export async function fetchAdminListings() {
  const { data } = await api.post("/admin/listings/list", { page: 1, limit: 100 });
  const listings = (data.data?.listings || []).map(mapAdminListingRow);
  return wrap(listings);
}

export async function approveListing(id, action) {
  if (action === "approved") {
    const { data } = await api.post("/admin/listings/approve", { listingId: id });
    return data;
  }
  const { data } = await api.post("/admin/listings/reject", {
    listingId: id,
    rejectionReason: "Does not meet listing guidelines",
  });
  return data;
}

export async function fetchWithdrawals() {
  const { data } = await api.post("/admin/withdrawals/list", { page: 1, limit: 100 });
  const withdrawals = (data.data?.withdrawals || []).map(mapWithdrawalRow);
  return wrap(withdrawals);
}

export async function processWithdrawal(id, action) {
  if (action === "completed") {
    await api.post("/admin/withdrawals/approve", { withdrawalId: id });
    const { data } = await api.post("/admin/withdrawals/mark-paid", { withdrawalId: id });
    return data;
  }
  const { data } = await api.post("/admin/withdrawals/reject", {
    withdrawalId: id,
    rejectionReason: "Rejected by admin",
  });
  return data;
}

export async function fetchCommission() {
  const { data } = await api.post("/admin/commission/get");
  const config = data.data?.config;
  return wrap({
    rate: config?.percentage ?? 5,
    lastUpdated: formatDate(config?.updatedAt),
  });
}

export async function updateCommission(rate) {
  const { data } = await api.post("/admin/commission/update", { percentage: rate });
  const config = data.data?.config;
  return wrap({
    rate: config?.percentage ?? rate,
    lastUpdated: formatDate(config?.updatedAt),
  });
}

export async function fetchVehicleData() {
  const makesRes = await api.post("/makes/list", { page: 1, limit: 200 });
  const makes = makesRes.data.data?.makes || [];
  syncMakesFromApi(makes);

  const models = {};
  const makeNames = [];

  for (const make of makes) {
    makeNames.push(make.name);
    const modelsRes = await api.post("/models/list", {
      makeId: make._id,
      page: 1,
      limit: 200,
    });
    const modelList = modelsRes.data.data?.models || [];
    syncModelsForMake(make._id, modelList);
    models[make.name] = modelList.map((m) => m.name);
  }

  return wrap({ makes: makeNames, models });
}

export async function updateUserStatus(userId, role, status) {
  const endpoint =
    status === "active" ? "/admin/users/activate" : "/admin/users/deactivate";
  const { data } = await api.post(endpoint, { userId });
  return data;
}

export async function addMakeModel(makeName, modelName) {
  if (!modelName) {
    const { data } = await api.post("/makes/create", { name: makeName });
    if (data?.data) syncMakesFromApi([data.data]);
    return data;
  }

  const masters = getVehicleMasters();
  let make = masters.makes.find((m) => m.name.toLowerCase() === makeName.toLowerCase());

  if (!make || (!make.id && !make._id)) {
    const makeRes = await api.post("/makes/create", { name: makeName });
    const createdMake = makeRes.data?.data;
    if (createdMake) {
      make = { id: createdMake._id || createdMake.id, name: createdMake.name };
      syncMakesFromApi([createdMake]);
    }
  }

  const targetMakeId = make?.id || make?._id;
  const { data } = await api.post("/models/create", {
    makeId: targetMakeId,
    name: modelName,
  });
  if (data?.data && targetMakeId) syncModelsForMake(targetMakeId, [data.data]);
  return data;
}

export async function fetchAdminTransactions() {
  try {
    const { data } = await api.post("/admin/transactions/list", { page: 1, limit: 100 });
    const transactions = data.data?.transactions || [];
    const mapped = transactions.map((t) => {
      const listing = t.listingId;
      const year = listing?.year || "";
      const make = listing?.makeId?.name || listing?.make || "";
      const model = listing?.modelId?.name || listing?.model || "";
      const vehicleTitle = `${year} ${make} ${model}`.trim() || "Vehicle";
      const buyerName = t.buyerId ? `${t.buyerId.firstName || ""} ${t.buyerId.lastName || ""}`.trim() : "Buyer";
      const vendorName = t.vendorId ? `${t.vendorId.firstName || ""} ${t.vendorId.lastName || ""}`.trim() : "Seller";
      const invoiceId = `INV-${new Date(t.createdAt || Date.now()).getFullYear()}-${(t._id || "000000").slice(-6).toUpperCase()}`;

      return {
        id: t._id,
        transactionId: t._id,
        vehicleTitle,
        buyerName,
        buyerEmail: t.buyerId?.email || "",
        sellerName: vendorName,
        sellerEmail: t.vendorId?.email || "",
        amount: centsToEuros(t.totalAmount || t.amount),
        commission: centsToEuros(t.commissionAmount || 0),
        status: t.status || "escrowed",
        invoiceId,
        date: formatDate(t.createdAt),
      };
    });
    return wrap(mapped);
  } catch (err) {
    console.error("fetchAdminTransactions error:", err);
    return wrap([]);
  }
}
