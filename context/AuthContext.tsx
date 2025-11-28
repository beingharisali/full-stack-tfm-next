"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	register as registerApi,
	login as loginApi,
	logoutApi,
	getProfile as getProfileApi,
	updateProfile as updateProfileApi,
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
	updateProfile: (
		firstName?: string,
		lastName?: string,
		email?: string,
		password?: string
	) => Promise<void>;
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
				return "/tasks";
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
			if (token) {
				await getProfile();
			} else {
				setLoading(false);
			}
		};
		
		initializeAuth();
	}, []);

	const getProfile = async () => {
		setLoading(true);
		try {
			const profile = await getProfileApi();
			if (profile) {
				setUser(profile.user);
			} else {
				if (typeof window !== "undefined") {
					localStorage.removeItem("token");
				}
				setUser(null);
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateProfile = async (
		firstName?: string,
		lastName?: string,
		email?: string,
		password?: string
	) => {
		try {
			const response = await updateProfileApi(firstName, lastName, email, password);
			setUser(response.user);
			
			if (typeof window !== "undefined") {
				const token = localStorage.getItem("token");
				if (token) {
					await getProfile();
				}
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			throw error;
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
			if (typeof window !== "undefined") {
				localStorage.setItem("token", res.token);
			}
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
				if (typeof window !== "undefined") {
					localStorage.setItem("token", res.token);
				}
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
		try {
			await logoutApi();
		} catch (error) {
			console.error("Error during logout API call:", error);
		} finally {
			setUser(null);
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
			}
			router.replace("/");
		}
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
				updateProfile,
			}}>
			{children}
		</AuthContext.Provider>
	);
}