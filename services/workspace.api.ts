import http from "./http";

export interface Workspace {
  _id: string;
  name: string;
  members: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceInvitation {
  _id: string;
  workspace: {
    _id: string;
    name: string;
  };
  invitedUser: string;
  invitedByEmail: string;
  invitedUserName: string;
  workspaceName: string;
  status: "pending" | "accepted" | "rejected";
  invitedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const createWorkspace = async (name: string) => {
  try {
    const response = await http.post("/workspace/create", { name });
    return response.data.workspace as Workspace;
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }
};

export const inviteMembersToWorkspace = async (workspaceId: string, members: string[]) => {
  try {
    const response = await http.post(`/workspace/invite/${workspaceId}`, { members });
    return response.data;
  } catch (error) {
    console.error("Error inviting members to workspace:", error);
    throw error;
  }
};

export const getUserWorkspaces = async () => {
  try {
    const response = await http.get("/workspace/user-workspaces");
    return response.data.workspaces as Workspace[];
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    throw error;
  }
};

export const getWorkspaceById = async (workspaceId: string) => {
  try {
    const response = await http.get(`/workspace/${workspaceId}`);
    return response.data.workspace as Workspace;
  } catch (error) {
    console.error("Error fetching workspace:", error);
    throw error;
  }
};

export const getWorkspaceInvitations = async () => {
  try {
    const response = await http.get("/workspace/invitations");
    return response.data.invitations as WorkspaceInvitation[];
  } catch (error) {
    console.error("Error fetching workspace invitations:", error);
    throw error;
  }
};

export const respondToInvitation = async (invitationId: string, response: "accepted" | "rejected") => {
  try {
    const res = await http.post("/workspace/invitations/respond", { 
      invitationId, 
      response 
    });
    return res.data;
  } catch (error) {
    console.error("Error responding to invitation:", error);
    throw error;
  }
};

export const leaveWorkspace = async (workspaceId: string) => {
  try {
    const response = await http.delete(`/workspace/leave/${workspaceId}`);
    return response.data;
  } catch (error) {
    console.error("Error leaving workspace:", error);
    throw error;
  }
};

export const getWorkspaceTasks = async (workspaceId: string) => {
  try {
    const response = await http.get(`/task/workspace/${workspaceId}`);
    return response.data.tasks;
  } catch (error) {
    console.error("Error fetching workspace tasks:", error);
    throw error;
  }
};