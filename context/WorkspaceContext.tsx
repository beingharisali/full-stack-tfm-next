"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getUserWorkspaces, Workspace } from "../services/workspace.api";

interface WorkspaceContextType {
  workspaces: Workspace[];
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  loading: true,
  refreshWorkspaces: async () => {},
});

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const refreshWorkspaces = async () => {
    if (!user) return;

    try {
      const userWorkspaces = await getUserWorkspaces();
      setWorkspaces(userWorkspaces);
    } catch (error) {
      console.error("Error refreshing workspaces:", error);
    }
  };

  useEffect(() => {
    const initializeWorkspaceData = async () => {
      if (user) {
        setLoading(true);
        try {
          await refreshWorkspaces();
        } catch (error) {
          console.error("Error initializing workspace data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setWorkspaces([]);
        setLoading(false);
      }
    };

    initializeWorkspaceData();
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        loading,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
