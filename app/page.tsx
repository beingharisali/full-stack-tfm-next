"use client";

import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

type RoleType = "user" | "admin" | "agent" | "";

interface FormData {
  email: string;
  password: string;
  role: RoleType;
}

export default function LoginPage() {
  const { loginUser } = useAuthContext();
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.role) {
      toast.error("Please select a role!", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await loginUser(formData.email, formData.password, formData.role);
      toast.success("Login Successful 🎉", { position: "top-center" });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        `Login Failed ❌: ${err.response?.data?.message || "Unknown error"}`,
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
            Welcome Back
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                required
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            {`Don't`} have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
