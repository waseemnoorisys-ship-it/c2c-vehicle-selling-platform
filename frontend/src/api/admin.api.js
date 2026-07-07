import api from "./axios";
import {
  MOCK_ADMIN_STATS,
  MOCK_REVENUE_CHART,
  MOCK_BUYERS,
  MOCK_SELLERS,
  MOCK_ADMIN_LISTINGS,
  MOCK_WITHDRAWALS,
  MOCK_COMMISSION,
  MOCK_MAKES,
  MOCK_MODELS,
} from "../data/mockData";

const USE_MOCK = true;
const delay = (data, ms = 300) =>
  new Promise((r) => setTimeout(() => r({ data: { data } }), ms));

export async function fetchAdminDashboard() {
  if (USE_MOCK) return delay({ stats: MOCK_ADMIN_STATS, chart: MOCK_REVENUE_CHART });
  return (await api.get("/admin/dashboard")).data;
}

export async function fetchBuyers() {
  if (USE_MOCK) return delay(MOCK_BUYERS);
  return (await api.get("/admin/buyers")).data;
}

export async function fetchSellers() {
  if (USE_MOCK) return delay(MOCK_SELLERS);
  return (await api.get("/admin/sellers")).data;
}

export async function fetchAdminListings() {
  if (USE_MOCK) return delay(MOCK_ADMIN_LISTINGS);
  return (await api.get("/admin/listings")).data;
}

export async function approveListing(id, action) {
  if (USE_MOCK) return delay({ id, approvalStatus: action });
  return (await api.patch(`/admin/listings/${id}`, { action })).data;
}

export async function fetchWithdrawals() {
  if (USE_MOCK) return delay(MOCK_WITHDRAWALS);
  return (await api.get("/admin/withdrawals")).data;
}

export async function processWithdrawal(id, action) {
  if (USE_MOCK) return delay({ id, status: action });
  return (await api.patch(`/admin/withdrawals/${id}`, { action })).data;
}

export async function fetchCommission() {
  if (USE_MOCK) return delay(MOCK_COMMISSION);
  return (await api.get("/admin/commission")).data;
}

export async function updateCommission(rate) {
  if (USE_MOCK) return delay({ rate, lastUpdated: new Date().toISOString().split("T")[0] });
  return (await api.put("/admin/commission", { rate })).data;
}

export async function fetchVehicleData() {
  if (USE_MOCK) return delay({ makes: MOCK_MAKES, models: MOCK_MODELS });
  return (await api.get("/admin/vehicle-data")).data;
}

export async function updateUserStatus(userId, role, status) {
  if (USE_MOCK) return delay({ userId, status });
  return (await api.patch(`/admin/${role}s/${userId}`, { status })).data;
}

export async function addMakeModel(make, model) {
  if (USE_MOCK) return delay({ make, model });
  return (await api.post("/admin/vehicle-data", { make, model })).data;
}
