"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { Eye, EyeOff, Save, X, User as UserIcon } from "lucide-react";

export default function AgentProfilePage() {
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

		// Clear validation error
		if (errors[name]) {
			setErrors((prev) => {
				const copy = { ...prev };
				delete copy[name];
				return copy;
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
			newErrors.email = "Invalid email format";
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

			setFormData((prev) => ({
				...prev,
				password: "",
				confirmPassword: "",
			}));
		} catch (error) {
			console.error("Update failed:", error);
			alert("Failed to update profile.");
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
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
			<ProtectedRoute requiredRole="agent">
				<Nav />
				<div className="min-h-screen flex items-center justify-center text-xl">
					Loading profile...
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute requiredRole="agent">
			<Nav />
			<div className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-teal-100">
				<div className="max-w-4xl mx-auto">

					{/* HEADER */}
					<div className="flex justify-between items-center mb-10">
						<h1 className="text-4xl font-bold text-gray-800">Agent Profile</h1>
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-3 px-6 rounded-full font-semibold shadow-lg hover:scale-105 transition"
							>
								Edit Profile
							</button>
						)}
					</div>

					{/* PROFILE CARD */}
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						{/* PROFILE HEADER */}
						<div className="bg-gradient-to-r from-green-600 to-teal-700 p-6 text-center">
							<div className="mx-auto bg-white p-1 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
								<UserIcon className="w-12 h-12 text-green-600" />
							</div>
							<h2 className="mt-4 text-2xl font-bold text-white">
								{user?.firstName} {user?.lastName}
							</h2>
							<p className="text-green-200 capitalize">{user?.role}</p>
						</div>

						{/* FORM OR DETAILS */}
						<div className="p-6">
							{isEditing ? (
								<form onSubmit={handleSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

										{/* FIRST NAME */}
										<div>
											<label className="font-medium">First Name</label>
											<input
												name="firstName"
												value={formData.firstName}
												onChange={handleChange}
												className={`w-full mt-1 p-3 border rounded-xl ${
													errors.firstName ? "border-red-500" : ""
												}`}
											/>
											{errors.firstName && (
												<p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
											)}
										</div>

										{/* LAST NAME */}
										<div>
											<label className="font-medium">Last Name</label>
											<input
												name="lastName"
												value={formData.lastName}
												onChange={handleChange}
												className={`w-full mt-1 p-3 border rounded-xl ${
													errors.lastName ? "border-red-500" : ""
												}`}
											/>
											{errors.lastName && (
												<p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
											)}
										</div>

										{/* EMAIL */}
										<div className="md:col-span-2">
											<label className="font-medium">Email</label>
											<input
												name="email"
												value={formData.email}
												onChange={handleChange}
												className={`w-full mt-1 p-3 border rounded-xl ${
													errors.email ? "border-red-500" : ""
												}`}
											/>
											{errors.email && (
												<p className="text-red-600 text-sm mt-1">{errors.email}</p>
											)}
										</div>

										{/* PASSWORD */}
										<div>
											<label className="font-medium">New Password</label>
											<div className="relative">
												<input
													type={showPassword ? "text" : "password"}
													name="password"
													value={formData.password}
													onChange={handleChange}
													className={`w-full mt-1 p-3 pr-12 border rounded-xl ${
														errors.password ? "border-red-500" : ""
													}`}
													placeholder="Leave blank to keep current"
												/>
												<button
													type="button"
													className="absolute right-3 top-3"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? <EyeOff /> : <Eye />}
												</button>
											</div>
											{errors.password && (
												<p className="text-red-600 text-sm mt-1">{errors.password}</p>
											)}
										</div>

										{/* CONFIRM PASSWORD */}
										<div>
											<label className="font-medium">Confirm Password</label>
											<div className="relative">
												<input
													type={showConfirmPassword ? "text" : "password"}
													name="confirmPassword"
													value={formData.confirmPassword}
													onChange={handleChange}
													className={`w-full mt-1 p-3 pr-12 border rounded-xl ${
														errors.confirmPassword ? "border-red-500" : ""
													}`}
												/>
												<button
													type="button"
													className="absolute right-3 top-3"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												>
													{showConfirmPassword ? <EyeOff /> : <Eye />}
												</button>
											</div>
											{errors.confirmPassword && (
												<p className="text-red-600 text-sm mt-1">
													{errors.confirmPassword}
												</p>
											)}
										</div>
									</div>

									{/* BUTTONS */}
									<div className="flex justify-end mt-6 space-x-4">
										<button
											type="button"
											onClick={handleCancel}
											className="px-6 py-3 border rounded-xl hover:bg-gray-100"
										>
											<X className="inline mr-2" /> Cancel
										</button>

										<button
											type="submit"
											disabled={saving}
											className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
										>
											<Save className="inline mr-2" />{" "}
											{saving ? "Saving..." : "Save Changes"}
										</button>
									</div>
								</form>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="p-4 bg-green-50 rounded-xl">
										<p className="font-semibold">First Name</p>
										<p>{user?.firstName}</p>
									</div>

									<div className="p-4 bg-green-50 rounded-xl">
										<p className="font-semibold">Last Name</p>
										<p>{user?.lastName}</p>
									</div>

									<div className="p-4 bg-green-50 rounded-xl md:col-span-2">
										<p className="font-semibold">Email</p>
										<p>{user?.email}</p>
									</div>

									<div className="p-4 bg-green-50 rounded-xl md:col-span-2">
										<p className="font-semibold">Role</p>
										<p className="capitalize">{user?.role}</p>
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
