"use client";

import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

type RoleType = "user" | "admin" | "agent" | "";

interface FormData {
  firstName: string;
  lastName: string;
  role: RoleType;
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    if (!formData.role) {
      toast.error("Please select a role!", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await registerUser(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.role
      );
      toast.success("Registration Successful 🎉", { position: "top-center" });
    } catch (error) {
      const err = error as { response?: { data?: { msg?: string } } };
      toast.error(
        `Registration Failed ❌: ${err.response?.data?.msg || "Unknown error"}`,
        { position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
        <div className="bg-white shadow-2xl p-10 rounded-2xl w-full max-w-md border border-gray-200">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            Create Account
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <select
              name="role"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
