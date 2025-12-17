import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { WorkspaceProvider } from "../context/WorkspaceContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow Manager",
  description: "A task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <WorkspaceProvider>
              {children}
            </WorkspaceProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}