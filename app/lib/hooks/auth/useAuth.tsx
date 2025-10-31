import { useState } from "react";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("API base URL is not defined in environment variables.");
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || axiosError.message;
      console.error("Auth operation failed:", errorMessage);
      toast.error(axiosError.response?.data?.message || defaultMessage);
    } else if (error instanceof Error) {
      console.error("Auth operation failed (general error):", error.message);
      toast.error(error.message || defaultMessage);
    } else {
      console.error("Auth operation failed (unknown error):", error);
      toast.error(defaultMessage);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      if (!API_BASE_URL) {
        throw new Error(
          "API base URL is not defined in environment variables. Cannot register."
        );
      }
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
      });
      console.log("Registration successful:", response.data);
      toast.success("Registered successfully! Please log in.");
      router.push("/");
      return true;
    } catch (error) {
      handleAuthError(error, "Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!API_BASE_URL) {
        throw new Error(
          "API base URL is not defined in environment variables. Cannot login."
        );
      }
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      console.log("Login successful:", response.data);
      toast.success("Login successfully!");
      router.push("");
      return true;
    } catch (error) {
      handleAuthError(error, "Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    register,
    login,
  };
}
