"use client";

import { useState } from "react";
// Assuming AuthContext.tsx exists and provides useAuthContext
// import { useAuthContext } from "../context/AuthContext"; 
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast"; // This was from TFM-NEXT-05
import Link from "next/link"; // This was from main

interface FormData {
	email: string;
	password: string;
	role: string;
}

export default function LoginPage() {
	// Changed from RegisterPage to LoginPage since this is a login form
	// const { loginUser } = useAuthContext(); // Uncomment if AuthContext is implemented
	const router = useRouter();
	const [formData, setFormData] = useState<FormData>({
		email: "",
		password: "",
		role: "",
	});

	const [loading, setLoading] = useState(false);

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const name = e.target.name;
		const value = e.target.value;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		try {
			setLoading(true);
			// await loginUser(formData.email, formData.password, formData.role as any); // Uncomment and implement loginUser logic
      // Placeholder for actual login logic
      console.log("Attempting login with:", formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // On successful login, redirect
      router.push("/dashboard"); 
      // Replace with actual error handling if login fails
		} catch (error) {
			const e = error as { response?: { data?: { msg?: string } } };
			alert(e.response?.data?.msg || "Login failed");
			console.error("Login failed:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-sm">
				<h2 className="text-2xl font-bold text-center mb-6">Login</h2>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="flex flex-col">
						<label
							htmlFor="email"
							className="text-sm font-medium text-gray-600">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="Enter your email"
							value={formData.email}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="password"
							className="text-sm font-medium text-gray-600">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="role" className="text-sm font-medium text-gray-600">
							Role
						</label>
						<select
							id="role"
							name="role"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							value={formData.role}
							onChange={handleChange}
							required
							disabled={loading}>
							<option value="">Select Role</option>
							<option value="user">User</option>
							<option value="admin">Admin</option>
							<option value="agent">Agent</option>
						</select>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>

				<p className="text-center text-sm text-gray-600 mt-4">
					{`Don't`} have an account?{" "}
					<Link
						href="/register"
						className="text-blue-600 font-semibold hover:underline">
						Register
					</Link>
				</p>
			</div>
      {/* The Toaster component was added here to resolve the conflict */}
      <Toaster /> 
		</div>
	);
}