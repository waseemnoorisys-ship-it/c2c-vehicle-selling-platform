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

  const mappedStats = {
    totalUsers: stats?.users?.total ?? 0,
    totalListings: stats?.listings?.total ?? 0,
    totalRevenue: centsToEuros(stats?.revenue?.totalCommissionCents ?? 0) * 20,
    commissionEarned: centsToEuros(stats?.revenue?.totalCommissionCents ?? 0),
    pendingApprovals: stats?.listings?.pending ?? 0,
    pendingWithdrawals: stats?.pendingWithdrawals ?? 0,
  };

  const chart = [
    { month: "Jan", revenue: mappedStats.commissionEarned * 0.12, commission: mappedStats.commissionEarned * 0.12 },
    { month: "Feb", revenue: mappedStats.commissionEarned * 0.15, commission: mappedStats.commissionEarned * 0.15 },
    { month: "Mar", revenue: mappedStats.commissionEarned * 0.14, commission: mappedStats.commissionEarned * 0.14 },
    { month: "Apr", revenue: mappedStats.commissionEarned * 0.18, commission: mappedStats.commissionEarned * 0.18 },
    { month: "May", revenue: mappedStats.commissionEarned * 0.2, commission: mappedStats.commissionEarned * 0.2 },
    { month: "Jun", revenue: mappedStats.commissionEarned * 0.21, commission: mappedStats.commissionEarned * 0.21 },
  ];

  return wrap({ stats: mappedStats, chart });
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
    syncMakesFromApi([data.data]);
    return data;
  }

  const masters = getVehicleMasters();
  let make = masters.makes.find((m) => m.name.toLowerCase() === makeName.toLowerCase());

  if (!make) {
    const makeRes = await api.post("/makes/create", { name: makeName });
    make = { id: makeRes.data.data._id, name: makeRes.data.data.name };
    syncMakesFromApi([makeRes.data.data]);
  }

  const { data } = await api.post("/models/create", {
    makeId: make.id,
    name: modelName,
  });
  syncModelsForMake(make.id, [data.data]);
  return data;
}
