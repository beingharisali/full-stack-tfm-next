import axios from "axios";

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
		// Only handle 401 errors specifically in the auth context, not globally
		// This prevents automatic logout on page refresh due to temporary issues
		return Promise.reject(error);
	}
);

export default http;