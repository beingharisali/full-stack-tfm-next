"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-600">Redirecting to login...</p>
    </div>
  );
}
