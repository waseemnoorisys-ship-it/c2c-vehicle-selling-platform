import api from "./axios";
import { FILTER_OPTIONS } from "../data/mockData";
import {
  wrap,
  mapListingToVehicle,
  eurosToCents,
  toBackendFuel,
  toBackendTransmission,
} from "./mappers";
import { findMakeIdByName, getMakeNames, syncMakesFromApi, syncModelsForMake } from "./vehicleMaster.cache";

function buildBrowseBody(filters = {}) {
  const body = { page: 1, limit: 50, sort: "newest" };

  if (filters.search) body.search = filters.search;
  if (filters.make) {
    const makeId = findMakeIdByName(filters.make);
    if (makeId) body.makeId = makeId;
    else body.search = filters.make;
  }
  if (filters.fuel) body.fuelType = toBackendFuel(filters.fuel);
  if (filters.bodyType) body.search = body.search ? `${body.search} ${filters.bodyType}` : filters.bodyType;
  if (filters.minPrice) body.minPrice = eurosToCents(filters.minPrice);
  if (filters.maxPrice) body.maxPrice = eurosToCents(filters.maxPrice);

  return body;
}

export async function fetchVehicles(filters = {}) {
  const { data } = await api.post("/listings/browse", buildBrowseBody(filters));
  const listings = data.data?.listings || [];
  return wrap(listings.map(mapListingToVehicle));
}

export async function fetchVehicleById(id) {
  const { data } = await api.post("/listings/get", { id });
  return wrap(mapListingToVehicle(data.data));
}

export async function fetchFilterOptions() {
  const cachedMakes = getMakeNames();
  return wrap({
    makes: cachedMakes.length ? cachedMakes : FILTER_OPTIONS.makes,
    bodyTypes: FILTER_OPTIONS.bodyTypes,
    fuelTypes: FILTER_OPTIONS.fuelTypes,
  });
}

export async function createOffer(vehicleId, amountEuros) {
  const { data } = await api.post("/offers/create", {
    listingId: vehicleId,
    amount: eurosToCents(amountEuros),
  });
  return data;
}

function buildListingPayload(payload, submitForApproval = true) {
  const makeId = payload.makeId || findMakeIdByName(payload.make);
  const modelId = payload.modelId;

  if (!makeId) {
    throw new Error("Make not found. Ask admin to add vehicle makes in Admin → Vehicle Data.");
  }
  if (!modelId) {
    throw new Error("Please select a model.");
  }

  return {
    makeId,
    modelId,
    year: Number(payload.year),
    mileage: Number(payload.mileage),
    fuelType: toBackendFuel(payload.fuel || payload.fuelType),
    transmission: toBackendTransmission(payload.transmission),
    askingPrice: eurosToCents(payload.price),
    locationText: payload.location || payload.locationText || "",
    submitForApproval,
  };
}

export async function createVehicle(payload) {
  const body = buildListingPayload(payload, true);
  const { data } = await api.post("/listings/create", body);
  return data;
}

export async function updateVehicle(id, payload) {
  const body = {
    id,
    year: payload.year ? Number(payload.year) : undefined,
    mileage: payload.mileage ? Number(payload.mileage) : undefined,
    fuelType: payload.fuel ? toBackendFuel(payload.fuel) : undefined,
    transmission: payload.transmission
      ? toBackendTransmission(payload.transmission)
      : undefined,
    askingPrice: payload.price ? eurosToCents(payload.price) : undefined,
    locationText: payload.location || payload.locationText,
  };
  if (payload.makeId) body.makeId = payload.makeId;
  if (payload.modelId) body.modelId = payload.modelId;

  const { data } = await api.post("/listings/update", body);
  return data;
}

/** Sync makes/models from browse results when cache is empty */
export async function warmVehicleMasterCache() {
  const { data } = await api.post("/listings/browse", { page: 1, limit: 100 });
  const listings = data.data?.listings || [];
  const makes = [];
  const modelsByMake = {};
  const seenMakes = new Set();

  for (const l of listings) {
    const makeId = l.makeId?._id;
    const modelId = l.modelId?._id;
    if (makeId && !seenMakes.has(makeId)) {
      seenMakes.add(makeId);
      makes.push({ _id: makeId, name: l.makeId.name });
    }
    if (makeId && modelId) {
      if (!modelsByMake[makeId]) modelsByMake[makeId] = new Map();
      modelsByMake[makeId].set(modelId, { _id: modelId, name: l.modelId.name });
    }
  }

  if (makes.length) syncMakesFromApi(makes);
  for (const [makeId, modelMap] of Object.entries(modelsByMake)) {
    syncModelsForMake(makeId, [...modelMap.values()]);
  }
}

