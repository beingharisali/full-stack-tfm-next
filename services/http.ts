import axios from "axios";
import { redirect } from "next/navigation";

const baseURL =
	process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
	"http://localhost:5000/api";

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
	return config;
});

http.interceptors.response.use(
	(response) => response,
	(error) => {
		if (typeof window !== "undefined" && error.response?.status === 401) {
			localStorage.removeItem("token");
						if (window.location.pathname !== "/") {
				window.location.href = "/";
			}
		}
		return Promise.reject(error);
	}
);

export default http;