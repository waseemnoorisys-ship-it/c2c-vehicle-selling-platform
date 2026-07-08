import api from "./axios";

export async function fetchMe() {
  const { data } = await api.post("/users/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.post("/users/update", payload);
  return data;
}

export async function saveFcmToken(fcmToken) {
  const { data } = await api.post("/users/fcm-token", { fcmToken });
  return data;
}
