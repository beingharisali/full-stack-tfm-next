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
      const timer = setTimeout(() => {
        if (!user) {
          router.replace("/");
          return;
        }
        
        if (requiredRole) {
          const hasAccess = Array.isArray(requiredRole) 
            ? requiredRole.includes(user.role) 
            : user.role === requiredRole;
            
  
          if (!hasAccess) {
            return;
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
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

  if (requiredRole) {
    const hasAccess = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role) 
      : user.role === requiredRole;

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. You are logged in as <span className="font-semibold">{user.role}</span>.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push(`/${user.role}/dashboard`)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Your Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}