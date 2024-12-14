import axios from "axios";

const BASE_URL = import.meta.env.REACT_APP_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Set auth token for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("job-jotter-token");
  console.debug("Authorization Token in Request:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  console.log("Authorization Header:", config.headers.Authorization); // Debug
  }
  return config;
});

export default api;

