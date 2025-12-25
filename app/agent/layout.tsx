"use client";

import React from "react";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="agent">
      <Nav />
      <div className="pt-16">
        {children}
      </div>
    </ProtectedRoute>
  );
}