import api from "./api";

let stockCache = null;
let pendingRequest = null;

export async function getAvailableStock() {
  if (stockCache) return stockCache;
  if (!pendingRequest) {
    pendingRequest = api.get("/available-stock")
      .then(({ data }) => {
        stockCache = data;
        return stockCache;
      })
      .finally(() => { pendingRequest = null; });
  }
  return pendingRequest;
}

export async function createStockVehicle(vehicle) {
  const { data } = await api.post("/available-stock", vehicle);
  stockCache = [data, ...(stockCache || [])];
  return data;
}

export async function updateStockVehicle(id, vehicle) {
  const { data } = await api.put(`/available-stock/${id}`, vehicle);
  stockCache = (stockCache || []).map((item) => item.id === id ? data : item);
  return data;
}

export async function removeStockVehicle(id) {
  await api.delete(`/available-stock/${id}`);
  stockCache = (stockCache || []).filter((item) => item.id !== id);
}
