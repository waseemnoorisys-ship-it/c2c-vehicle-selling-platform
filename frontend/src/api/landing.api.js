import api from "./axios";
import { wrap } from "./mappers";

export async function fetchLandingData() {
  const { data } = await api.post("/landing/data");
  return wrap(data.data);
}
