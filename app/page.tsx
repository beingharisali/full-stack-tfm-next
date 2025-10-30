"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data);
      toast.success("Login successfully!");
      router.push("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message || axiosError.message;
        console.error("Login failed:", errorMessage);
        toast.error(
          axiosError.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
      } else if (error instanceof Error) {
        console.error("Login failed (general error):", error.message);
        toast.error(
          error.message || "An unexpected error occurred during login."
        );
      } else {
        console.error("Login failed (unknown error):", error);
        toast.error("An unknown error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {" "}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            {"Don’t"} have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
