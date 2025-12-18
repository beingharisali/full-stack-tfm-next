import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api" ||
  "https://full-stack-tfm-node.onrender.com";

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("HTTP Request:", config.method?.toUpperCase(), config.url, config.headers);
  return config;
});

http.interceptors.response.use(
  (response) => {
    console.log("HTTP Response:", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("HTTP Error:", error.message);
    if (error.response) {
      console.error("Error Response:", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default http;