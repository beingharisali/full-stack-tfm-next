"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	register as registerApi,
	login as loginApi,
	logoutApi,
	getProfile as getProfileApi,
} from "../services/auth.api";
import type { User, UserRole, AuthResponse } from "../types/user";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	registerUser: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		role: UserRole
	) => Promise<void>;
	loginUser: (email: string, password: string, role: UserRole) => Promise<void>;
	logoutUser: () => Promise<void>;
	getProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
	return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const getRedirectPath = (role?: string) => {
		switch (role) {
			case "admin":
				return "/admin/dashboard";
			case "agent":
				return "/agent/dashboard";
			case "user":
				return "/user/dashboard";
			default:
				return "/dashboard";
		}
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			getProfile();
		} else {
			setLoading(false);
		}
	}, []);

	const getProfile = async () => {
		try {
			const profile = await getProfileApi();
			if (profile) {
				setUser(profile.user);
			} else {
				localStorage.removeItem("token");
				setUser(null);
			}
		} catch (error) {
			localStorage.removeItem("token");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const registerUser = async (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		role: UserRole
	) => {
		const res: AuthResponse = await registerApi(
			firstName,
			lastName,
			email,
			password,
			role as string
		);

		if (res.token) {
			localStorage.setItem("token", res.token);
		} else {
			console.warn(
				"Registration successful but no token received. User might need to log in manually."
			);
		}
		setUser(res.user);
		router.replace(getRedirectPath(res.user.role));
	};

	const loginUser = async (email: string, password: string, role: UserRole) => {
		try {
			const res: AuthResponse = await loginApi(email, password, role as string);

			if (res?.token) {
				localStorage.setItem("token", res.token);
			} else {
				throw new Error("Login successful but no token received.");
			}

			if (res?.user) {
				setUser(res.user);
				router.replace(getRedirectPath(res.user.role));
			} else {
				throw new Error("Invalid user data received after login.");
			}
		} catch (error) {
			console.error("Login failed in AuthContext:", error);
			throw error;
		}
	};

	const logoutUser = async () => {
		await logoutApi();
		setUser(null);
		localStorage.removeItem("token");
		router.replace("/");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				registerUser,
				loginUser,
				logoutUser,
				getProfile,
			}}>
			{children}
		</AuthContext.Provider>
	);
}