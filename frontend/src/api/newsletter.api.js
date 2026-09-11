import api from "./axios";

export const subscribeApi = (data) => api.post("/newsletter/subscribe", data);

export const unsubscribeApi = (data) => api.post("/newsletter/unsubscribe", data);
