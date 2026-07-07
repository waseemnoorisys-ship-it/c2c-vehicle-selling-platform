import api from "./axios";
import { MOCK_VEHICLES, FILTER_OPTIONS } from "../data/mockData";

const USE_MOCK = true;

function mockDelay(data, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve({ data: { data } }), ms));
}

export async function fetchVehicles(filters = {}) {
  if (USE_MOCK) {
    let results = [...MOCK_VEHICLES].filter((v) => v.status === "active");
    if (filters.make) results = results.filter((v) => v.make === filters.make);
    if (filters.bodyType) results = results.filter((v) => v.bodyType === filters.bodyType);
    if (filters.fuel) results = results.filter((v) => v.fuel === filters.fuel);
    if (filters.minPrice) results = results.filter((v) => v.price >= filters.minPrice);
    if (filters.maxPrice) results = results.filter((v) => v.price <= filters.maxPrice);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (v) => v.title.toLowerCase().includes(q) || v.make.toLowerCase().includes(q)
      );
    }
    return mockDelay(results);
  }
  const { data } = await api.get("/vehicles", { params: filters });
  return data;
}

export async function fetchVehicleById(id) {
  if (USE_MOCK) {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === id);
    if (!vehicle) throw { response: { data: { message: "Vehicle not found" } } };
    return mockDelay(vehicle);
  }
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
}

export async function fetchFilterOptions() {
  if (USE_MOCK) return mockDelay(FILTER_OPTIONS);
  const { data } = await api.get("/vehicles/filters");
  return data;
}

export async function createOffer(vehicleId, amount) {
  if (USE_MOCK) return mockDelay({ id: `o${Date.now()}`, vehicleId, amount, status: "pending" });
  const { data } = await api.post("/offers", { vehicleId, amount });
  return data;
}

export async function createVehicle(payload) {
  if (USE_MOCK) return mockDelay({ id: `v${Date.now()}`, ...payload, status: "pending" });
  const { data } = await api.post("/vendor/vehicles", payload);
  return data;
}

export async function updateVehicle(id, payload) {
  if (USE_MOCK) return mockDelay({ id, ...payload });
  const { data } = await api.put(`/vendor/vehicles/${id}`, payload);
  return data;
}
