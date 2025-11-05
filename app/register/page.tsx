"use client";

import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import Link from "next/link";

interface FormData {
	firstName: string;
	lastName: string;
	role: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export default function RegisterPage() {
	const { registerUser } = useAuthContext();
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		role: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		if (!formData.role) {
			alert("Please select a role!");
			return;
		}

		try {
			setLoading(true);
			await registerUser(
				formData.firstName,
				formData.lastName,
				formData.email,
				formData.password,
				formData.role as any
			);
		} catch (error) {
			const e = error as { response?: { data?: { msg?: string } } };
			alert(e.response?.data?.msg || "Registration failed");
			console.error("Registration failed:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-sm">
				<h2 className="text-2xl font-bold text-center mb-6">Register</h2>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="flex flex-col">
						<label
							htmlFor="firstName"
							className="text-sm font-medium text-gray-600">
							First Name
						</label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="Enter your first name"
							value={formData.firstName}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="lastName"
							className="text-sm font-medium text-gray-600">
							Last Name
						</label>
						<input
							type="text"
							id="lastName"
							name="lastName"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="Enter your last name"
							value={formData.lastName}
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
						<label
							htmlFor="confirmPassword"
							className="text-sm font-medium text-gray-600">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="Re-enter your password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={loading}>
						{loading ? "Registering..." : "Register"}
					</button>
				</form>

				<p className="text-center text-sm text-gray-600 mt-4">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-blue-600 font-semibold hover:underline">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
}
