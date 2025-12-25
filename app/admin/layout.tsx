"use client";

import React from "react";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <Nav />
      <div className="pt-16">
        {children}
      </div>
    </ProtectedRoute>
  );
}