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

export const createWorkspace = async (name: string) => {
  try {
    const response = await http.post("/workspace/create", { name });
    return response.data.workspace as Workspace;
  } catch (error) {

    throw error;
  }
};



export const getUserWorkspaces = async () => {
  try {
    console.log("Fetching user workspaces");
    const response = await http.get("/workspace/user-workspaces");
    console.log("User workspaces response:", response);
    console.log("User workspaces response data:", response.data);
    return response.data.workspaces as Workspace[];
  } catch (error: any) {
    console.error("Error fetching user workspaces:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};

export const getWorkspaceById = async (workspaceId: string) => {
  try {
    const response = await http.get(`/workspace/${workspaceId}`);
    return response.data.workspace as Workspace;
  } catch (error) {

    throw error;
  }
};

export const leaveWorkspace = async (workspaceId: string) => {
  try {
    const response = await http.delete(`/workspace/leave/${workspaceId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getWorkspaceTasks = async (workspaceId: string) => {
  try {
    const response = await http.get(`/task/workspace/${workspaceId}`);
    return response.data.tasks;
  } catch (error) {

    throw error;
  }
};

export const addMembersToWorkspace = async (workspaceId: string, members: string[]) => {
  try {
    console.log("Adding members to workspace:", workspaceId, members);
    const response = await http.post(`/workspace/${workspaceId}/add-members`, { members });
    console.log("Add members response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding members:", error);
    throw error;
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const response = await http.delete(`/workspace/${workspaceId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};