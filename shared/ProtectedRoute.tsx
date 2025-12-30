"use client";

import { useAuthContext } from "@/hooks/authHook";
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
          router.replace(`/${user.role}/dashboard`);
          return;
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

 
  return children;
}