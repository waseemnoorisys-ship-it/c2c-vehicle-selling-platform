import api from "./axios";

export async function fetchMe() {
  const { data } = await api.post("/users/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.post("/users/update", payload);
  return data;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await api.post("/users/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function saveFcmToken(fcmToken) {
  const { data } = await api.post("/users/fcm-token", { fcmToken });
  return data;
}

export async function toggleFavoriteApi(listingId) {
  const { data } = await api.post("/users/favorites/toggle", { listingId });
  return data;
}

export async function fetchSavedVehiclesApi() {
  const { data } = await api.get("/users/favorites");
  return data;
}
