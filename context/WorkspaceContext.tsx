"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { 
  getUserWorkspaces, 
  getWorkspaceInvitations,
  Workspace,
  WorkspaceInvitation
} from "../services/workspace.api";

interface WorkspaceContextType {
  workspaces: Workspace[];
  invitations: WorkspaceInvitation[];
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  refreshInvitations: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  invitations: [],
  loading: true,
  refreshWorkspaces: async () => {},
  refreshInvitations: async () => {},
});

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
};

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const refreshWorkspaces = async () => {
    if (!user) return;
    
    try {
      const userWorkspaces = await getUserWorkspaces();
      setWorkspaces(userWorkspaces);
    } catch (error) {
      console.error("Error refreshing workspaces:", error);
    }
  };

  const refreshInvitations = async () => {
    if (!user) return;
    
    try {
      const userInvitations = await getWorkspaceInvitations();
      setInvitations(userInvitations);
    } catch (error) {
      console.error("Error refreshing invitations:", error);
      // Don't let invitation errors affect the rest of the app
      setInvitations([]);
    }
  };

  useEffect(() => {
    const initializeWorkspaceData = async () => {
      if (user) {
        setLoading(true);
        try {
          await Promise.all([
            refreshWorkspaces(),
            refreshInvitations()
          ]);
        } catch (error) {
          console.error("Error initializing workspace data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setWorkspaces([]);
        setInvitations([]);
        setLoading(false);
      }
    };

    initializeWorkspaceData();
  }, [user]);

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        invitations, 
        loading, 
        refreshWorkspaces, 
        refreshInvitations 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};