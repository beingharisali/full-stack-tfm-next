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

  const [message, setMessage] = useState(""); // from TFM branch

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
      setMessage("Profile updated successfully!");

      setTimeout(() => setMessage(""), 3000);

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile. Try again.");
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
      <ProtectedRoute requiredRole="user">
        <Nav />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="user">
      <Nav />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-center font-medium ${
                message.includes("success")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">User Profile</h1>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-700 hover:opacity-90 text-white font-semibold py-3 px-6 rounded-full shadow-md transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-6 flex flex-col items-center">
              <div className="bg-white rounded-full p-2 shadow-md">
                <div className="bg-purple-100 rounded-full w-24 h-24 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-purple-600" />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>

              <p className="text-purple-200 capitalize">{user?.role}</p>
            </div>

            <div className="p-6">
              {isEditing ? (
                /* ======================= EDIT FORM ======================= */
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* FIRST NAME + LAST NAME */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* PASSWORD & CONFIRM PASSWORD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl pr-12 ${
                            errors.password ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Leave blank to keep current"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>

                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Confirm Password
                      </label>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl pr-12 ${
                            errors.confirmPassword ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>

                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border rounded-xl"
                    >
                      <X className="inline w-5 h-5 mr-2" /> Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                /* =================== VIEW MODE =================== */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 p-5 rounded-xl">
                      <h3 className="text-sm text-purple-800 font-semibold">
                        First Name
                      </h3>
                      <p className="text-lg text-gray-900">{user?.firstName}</p>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-xl">
                      <h3 className="text-sm text-purple-800 font-semibold">
                        Last Name
                      </h3>
                      <p className="text-lg text-gray-900">{user?.lastName}</p>
                    </div>

                    <div className="bg-pink-50 p-5 rounded-xl md:col-span-2">
                      <h3 className="text-sm text-pink-800 font-semibold">
                        Email
                      </h3>
                      <p className="text-lg text-gray-900">{user?.email}</p>
                    </div>

                    <div className="bg-fuchsia-50 p-5 rounded-xl md:col-span-2">
                      <h3 className="text-sm text-fuchsia-800 font-semibold">
                        Role
                      </h3>
                      <p className="text-lg text-gray-900 capitalize">
                        {user?.role}
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
