"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { Eye, EyeOff, Save, X, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
	const router = useRouter();
	const { user, updateProfile, loading } = useAuthContext();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				password: "",
				confirmPassword: "",
			});
		}
	}, [user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		
		if (!formData.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}
		
		if (!formData.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}
		
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}
		
		if (formData.password && formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}
		
		if (formData.password && formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) return;
		
		setSaving(true);
		try {
			// Only send fields that have values to avoid overwriting with empty strings
			const updateData = {
				firstName: formData.firstName || undefined,
				lastName: formData.lastName || undefined,
				email: formData.email || undefined,
				password: formData.password || undefined,
			};
			
			await updateProfile(
				updateData.firstName,
				updateData.lastName,
				updateData.email,
				updateData.password
			);
			
			setIsEditing(false);
			// Reset password fields after successful update
			setFormData(prev => ({
				...prev,
				password: "",
				confirmPassword: ""
			}));
		} catch (error: any) {
			console.error("Error updating profile:", error);
			// Handle error display if needed
			alert("Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		// Reset form to original user data
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				password: "",
				confirmPassword: "",
			});
		}
		setErrors({});
		setIsEditing(false);
	};

	if (loading) {
		return (
			<ProtectedRoute requiredRole="user">
				<Nav />
				<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
					<div className="text-xl text-gray-700">Loading profile...</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute requiredRole="user">
			<Nav />
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-4xl font-bold text-gray-800">User Profile</h1>
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105"
							>
								Edit Profile
							</button>
						)}
					</div>

					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						<div className="bg-gradient-to-r from-purple-600 to-pink-700 p-6">
							<div className="flex flex-col items-center">
								<div className="relative">
									<div className="bg-white border-4 border-white rounded-full p-1 shadow-lg">
										<div className="bg-gradient-to-br from-purple-100 to-pink-200 border-2 border-dashed border-white rounded-full w-24 h-24 flex items-center justify-center">
											<UserIcon className="w-12 h-12 text-purple-600" />
										</div>
									</div>
									{!isEditing && (
										<div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
											<div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
												<div className="w-2 h-2 bg-white rounded-full"></div>
											</div>
										</div>
									)}
								</div>
								<h2 className="mt-4 text-2xl font-bold text-white">
									{user?.firstName} {user?.lastName}
								</h2>
								<p className="text-purple-200 capitalize">{user?.role}</p>
							</div>
						</div>

						<div className="p-6">
							{isEditing ? (
								<form onSubmit={handleSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
										<div>
											<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
												First Name
											</label>
											<input
												type="text"
												id="firstName"
												name="firstName"
												value={formData.firstName}
												onChange={handleChange}
												className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 ${
													errors.firstName ? "border-red-500" : "border-gray-300"
												}`}
												placeholder="Enter your first name"
											/>
											{errors.firstName && (
												<p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
											)}
										</div>

										<div>
											<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
												Last Name
											</label>
											<input
												type="text"
												id="lastName"
												name="lastName"
												value={formData.lastName}
												onChange={handleChange}
												className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 ${
													errors.lastName ? "border-red-500" : "border-gray-300"
												}`}
												placeholder="Enter your last name"
											/>
											{errors.lastName && (
												<p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
											)}
										</div>

										<div className="md:col-span-2">
											<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
												Email Address
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 ${
													errors.email ? "border-red-500" : "border-gray-300"
												}`}
												placeholder="Enter your email"
											/>
											{errors.email && (
												<p className="mt-1 text-sm text-red-600">{errors.email}</p>
											)}
										</div>

										<div>
											<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
												New Password
											</label>
											<div className="relative">
												<input
													type={showPassword ? "text" : "password"}
													id="password"
													name="password"
													value={formData.password}
													onChange={handleChange}
													className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 ${
														errors.password ? "border-red-500" : "border-gray-300"
													}`}
													placeholder="Enter new password (optional)"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute inset-y-0 right-0 pr-4 flex items-center"
												>
													{showPassword ? (
														<EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
													) : (
														<Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
													)}
												</button>
											</div>
											{errors.password && (
												<p className="mt-1 text-sm text-red-600">{errors.password}</p>
											)}
											<p className="mt-1 text-xs text-gray-500">
												Leave blank to keep current password
											</p>
										</div>

										<div>
											<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
												Confirm New Password
											</label>
											<div className="relative">
												<input
													type={showConfirmPassword ? "text" : "password"}
													id="confirmPassword"
													name="confirmPassword"
													value={formData.confirmPassword}
													onChange={handleChange}
													className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 ${
														errors.confirmPassword ? "border-red-500" : "border-gray-300"
													}`}
													placeholder="Confirm new password"
												/>
												<button
													type="button"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													className="absolute inset-y-0 right-0 pr-4 flex items-center"
												>
													{showConfirmPassword ? (
														<EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
													) : (
														<Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
													)}
												</button>
											</div>
											{errors.confirmPassword && (
												<p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
											)}
										</div>
									</div>

									<div className="flex justify-end space-x-4">
										<button
											type="button"
											onClick={handleCancel}
											className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-300 font-medium"
											disabled={saving}
										>
											<X className="w-5 h-5 inline mr-2" />
											Cancel
										</button>
										<button
											type="submit"
											className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white font-semibold rounded-xl shadow-md transition duration-300 disabled:opacity-50 flex items-center"
											disabled={saving}
										>
											<Save className="w-5 h-5 inline mr-2" />
											{saving ? "Saving..." : "Save Changes"}
										</button>
									</div>
								</form>
							) : (
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
											<h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-1">First Name</h3>
											<p className="text-lg font-medium text-gray-900">
												{user?.firstName || "Not provided"}
											</p>
										</div>

										<div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
											<h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-1">Last Name</h3>
											<p className="text-lg font-medium text-gray-900">
												{user?.lastName || "Not provided"}
											</p>
										</div>

										<div className="md:col-span-2 bg-pink-50 rounded-xl p-5 border border-pink-100">
											<h3 className="text-sm font-semibold text-pink-800 uppercase tracking-wider mb-1">Email Address</h3>
											<p className="text-lg font-medium text-gray-900">
												{user?.email || "Not provided"}
											</p>
										</div>

										<div className="md:col-span-2 bg-fuchsia-50 rounded-xl p-5 border border-fuchsia-100">
											<h3 className="text-sm font-semibold text-fuchsia-800 uppercase tracking-wider mb-1">Role</h3>
											<p className="text-lg font-medium text-gray-900 capitalize">
												{user?.role || "Not specified"}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}