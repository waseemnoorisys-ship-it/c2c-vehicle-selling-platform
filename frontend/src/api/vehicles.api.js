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
import useCurrencyStore from "../store/useCurrencyStore";

function buildBrowseBody(filters = {}) {
  const body = { page: 1, limit: 50, sort: "newest" };

  if (filters.search) body.search = filters.search;
  if (filters.make) {
    const makeId = findMakeIdByName(filters.make);
    if (makeId) body.makeId = makeId;
    else body.search = filters.make;
  }
  if (filters.modelId) body.modelId = filters.modelId;
  if (filters.fuel) body.fuelType = toBackendFuel(filters.fuel);
  if (filters.bodyType) body.search = body.search ? `${body.search} ${filters.bodyType}` : filters.bodyType;
  if (filters.minPrice) body.minPrice = eurosToCents(filters.minPrice);
  if (filters.maxPrice) body.maxPrice = eurosToCents(filters.maxPrice);

  return body;
}

function buildPriceRanges(pricesEuros) {
  const symbol = useCurrencyStore.getState().getSymbol() || "$";
  const any = { label: "Any price", value: "", min: "", max: "" };

  if (!pricesEuros.length) {
    return [
      any,
      { label: `Under ${symbol}15,000`, value: "0-15000", min: 0, max: 15000 },
      { label: `${symbol}15,000 – ${symbol}30,000`, value: "15000-30000", min: 15000, max: 30000 },
      { label: `${symbol}30,000 – ${symbol}50,000`, value: "30000-50000", min: 30000, max: 50000 },
      { label: `Over ${symbol}50,000`, value: "50000-", min: 50000, max: "" },
    ];
  }

  const min = Math.floor(Math.min(...pricesEuros) / 5000) * 5000;
  const max = Math.ceil(Math.max(...pricesEuros) / 5000) * 5000;
  const span = max - min || 5000;
  const step = Math.max(5000, Math.round(span / 4 / 5000) * 5000);
  const ranges = [any];

  for (let start = min; start < max; start += step) {
    const end = start + step;
    ranges.push({
      label: `${symbol}${start.toLocaleString()} – ${symbol}${end.toLocaleString()}`,
      value: `${start}-${end}`,
      min: start,
      max: end,
    });
  }

  ranges.push({
    label: `Over ${symbol}${max.toLocaleString()}`,
    value: `${max}-`,
    min: max,
    max: "",
  });

  return ranges;
}

/** Makes, models-by-make, and price ranges from DB */
export async function fetchSearchFilterData() {
  const { data } = await api.post("/landing/search-filters");
  const payload = data.data || {};

  if (payload.makes?.length) {
    syncMakesFromApi(payload.makes.map((m) => ({ _id: m.id, name: m.name })));
    for (const [makeId, modelList] of Object.entries(payload.models || {})) {
      syncModelsForMake(
        makeId,
        modelList.map((m) => ({ _id: m.id, name: m.name }))
      );
    }
  }

  return wrap({
    makes: payload.makes || [],
    models: payload.models || {},
    priceRanges: payload.priceRanges || buildPriceRanges([]),
  });
}

export async function fetchVehicles(filters = {}) {
  const { data } = await api.post("/listings/browse", buildBrowseBody(filters));
  const listings = data.data?.listings || [];
  return wrap(listings.map(mapListingToVehicle));
}

export async function fetchFeaturedVehicles(limit = 4) {
  const { data } = await api.post("/listings/browse", { page: 1, limit, sort: "newest" });
  const listings = data.data?.listings || [];
  return wrap(listings.map(mapListingToVehicle));
}

export async function fetchVehicleById(id) {
  const { data } = await api.post("/listings/get", { id });
  return wrap(mapListingToVehicle(data.data));
}

export async function fetchFilterOptions() {
  try {
    const res = await fetchSearchFilterData();
    const makes = (res.data.data.makes || []).map((m) => m.name);
    return wrap({
      makes: makes.length ? makes : FILTER_OPTIONS.makes,
      bodyTypes: FILTER_OPTIONS.bodyTypes,
      fuelTypes: FILTER_OPTIONS.fuelTypes,
    });
  } catch {
    const cachedMakes = getMakeNames();
    return wrap({
      makes: cachedMakes.length ? cachedMakes : FILTER_OPTIONS.makes,
      bodyTypes: FILTER_OPTIONS.bodyTypes,
      fuelTypes: FILTER_OPTIONS.fuelTypes,
    });
  }
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

function appendListingFields(formData, payload, submitForApproval = true) {
  const body = buildListingPayload(payload, submitForApproval);
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export async function createVehicleWithPhotos(payload, files) {
  const formData = appendListingFields(new FormData(), payload, true);
  (files || []).forEach((file) => formData.append("photos", file));
  const { data } = await api.post("/listings/create-with-photos", formData);
  return data;
}

export async function addListingPhotos(listingId, files) {
  const formData = new FormData();
  formData.append("id", listingId);
  (files || []).forEach((file) => formData.append("photos", file));
  const { data } = await api.post("/listings/photos/add", formData);
  return data;
}

export async function deleteListingPhoto(listingId, publicId) {
  const { data } = await api.post("/listings/photos/delete", { id: listingId, publicId });
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

