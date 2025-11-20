"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
        return;
      }
      
      if (requiredRole) {
        const hasAccess = Array.isArray(requiredRole) 
          ? requiredRole.includes(user.role) 
          : user.role === requiredRole;
          
        if (!hasAccess) {
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
              router.replace("/");
          }
        }
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (
    requiredRole &&
    ((Array.isArray(requiredRole) && !requiredRole.includes(user.role)) ||
      (typeof requiredRole === "string" && user.role !== requiredRole))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}