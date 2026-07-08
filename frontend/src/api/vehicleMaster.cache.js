const STORAGE_KEY = "c2c-vehicle-masters";

export function getVehicleMasters() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { makes: [], models: {} };
  } catch {
    return { makes: [], models: {} };
  }
}

export function saveVehicleMasters(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function syncMakesFromApi(makes) {
  const current = getVehicleMasters();
  const byId = new Map(current.makes.map((m) => [m.id, m]));
  for (const make of makes) {
    byId.set(make._id || make.id, {
      id: make._id || make.id,
      name: make.name,
    });
  }
  saveVehicleMasters({ ...current, makes: [...byId.values()] });
}

export function syncModelsForMake(makeId, models) {
  const current = getVehicleMasters();
  const modelList = models.map((m) => ({
    id: m._id || m.id,
    name: m.name,
    makeId,
  }));
  saveVehicleMasters({
    ...current,
    models: { ...current.models, [makeId]: modelList },
  });
}

export function findMakeIdByName(name) {
  const { makes } = getVehicleMasters();
  const found = makes.find((m) => m.name.toLowerCase() === name.toLowerCase());
  return found?.id;
}

export function getMakeNames() {
  return getVehicleMasters().makes.map((m) => m.name);
}

export function getModelsForMakeId(makeId) {
  return getVehicleMasters().models[makeId] || [];
}
