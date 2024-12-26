import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Set auth token for every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("job-jotter-token");
  let tokenObj;

   try {
    tokenObj = JSON.parse(stored);
  } catch (err) {
    tokenObj = null;
  }

  // 3. If we have a valid object with a token field, attach that
  if (tokenObj?.token) {
    config.headers.Authorization = `Bearer ${tokenObj.token}`;
  }

  return config;
});

export default api;

