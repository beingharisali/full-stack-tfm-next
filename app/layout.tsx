import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { WorkspaceProvider } from "../context/WorkspaceContext";
import ChatWidget from "./component/ChatWidget";
import AuthLoadingProvider from "./component/AuthLoadingProvider";
import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        <AuthProvider>
          <SocketProvider>
            <WorkspaceProvider>
              <AuthLoadingProvider>
                {children}
                <ChatWidget />
              </AuthLoadingProvider>
            </WorkspaceProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}