import http from "./http";
import { User } from "../types/user";

export async function register(
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	role?: string
): Promise<{ user: User; token: string }> {
	const res = await http.post("/auth/register", {
		firstName,
		lastName,
		email,
		password,
		role,
	});
	return res.data;
}

export async function login(
	email: string,
	password: string,
	role?: string
): Promise<{ user: User; token: string }> {
	const res = await http.post("/auth/login", { email, password, role });
	return res.data;
}

export async function getProfile(): Promise<{ user: User } | null> {
  try {
    const res = await http.get("/auth/profile");
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      return null;
    }
    throw error;
  }
}

export async function updateProfile(
	firstName?: string,
	lastName?: string,
	email?: string,
	password?: string
): Promise<{ user: User }> {
	const res = await http.put("/auth/profile", {
		firstName,
		lastName,
		email,
		password,
	});
	return res.data;
}

// ✅ RESOLVED VERSION
export async function getAllUsers(): Promise<{ users: User[] }> {
	const res = await http.get("/auth/users");
	return res.data;
}

export async function logoutApi(): Promise<void> {
	try {
		await http.post("/auth/logout");
	} catch (error) {
		console.error("Logout API error:", error);
	} finally {
		if (typeof window !== "undefined") {
			localStorage.removeItem("token");
		}
	}
}
