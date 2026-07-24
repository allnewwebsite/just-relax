import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api" });
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  return config;
});
export default api;
