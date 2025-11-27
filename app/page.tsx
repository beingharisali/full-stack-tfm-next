"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { LogIn, User, Lock, Shield } from "lucide-react";

type RoleType = "user" | "admin" | "agent" | "";

interface FormData {
  email: string;
  password: string;
  role: RoleType;
}

export default function LoginPage() {
  const { loginUser, user } = useAuthContext();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          router.replace("/admin/dashboard");
          break;
        case "agent":
          router.replace("/agent/dashboard");
          break;
        case "user":
          router.replace("/user/dashboard");
          break;
        default:
          router.replace("/tasks");
      }
    }
  }, [user, router]);

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
      <Toaster />
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
        <div className='bg-white shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 overflow-hidden'>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <div className="bg-white/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className='text-2xl font-bold text-white'>
              Welcome Back
            </h2>
            <p className="text-blue-100 mt-2">Sign in to your account</p>
          </div>
          
          <div className="p-6">
            <form
              className='space-y-5'
              onSubmit={handleSubmit}>
              <div>
                <label className='block text-gray-700 mb-2 font-medium'>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type='email'
                    name='email'
                    placeholder='Enter your email'
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 mb-2 font-medium'>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type='password'
                    name='password'
                    placeholder='Enter your password'
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 mb-2 font-medium'>
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name='role'
                    value={formData.role}
                    onChange={handleChange}
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white'
                    required
                    disabled={loading}>
                    <option value=''>Select Role</option>
                    <option value='user'>User</option>
                    <option value='agent'>Agent</option>
                    <option value='admin'>Admin</option>
                  </select>
                </div>
              </div>

              <button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition disabled:opacity-50 shadow-md'
                disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : "Login"}
              </button>
            </form>

            <p className='text-center mt-6 text-gray-600 text-sm'>
              {`Don't`} have an account?{" "}
              <Link
                href='/register'
                className='text-blue-600 font-semibold hover:underline'>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}