"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { getAllUsers, getUserByEmail } from "../../../services/auth.api";
import { createWorkspace, inviteMembersToWorkspace, getUserWorkspaces, Workspace } from "../../../services/workspace.api";
import ProtectedRoute from "../../../shared/ProtectedRoute";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const WorkspaceManagementPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailInput, setEmailInput] = useState(""); // For email-based invitation
  const [userFound, setUserFound] = useState<User | null>(null); // To store found user

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
      }
    };

    const fetchWorkspaces = async () => {
      try {
        const response = await getUserWorkspaces();
        setWorkspaces(response);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
        setError("Failed to fetch workspaces");
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
      fetchWorkspaces();
    }
  }, [user]);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError("Please enter a workspace name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newWorkspace = await createWorkspace(workspaceName);
      setWorkspaces([...workspaces, newWorkspace]);
      setWorkspaceName("");
      setSuccess("Workspace created successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create workspace. Please try again.");
      console.error("Error creating workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUserByEmail = async () => {
    if (!emailInput.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getUserByEmail(emailInput);
      setUserFound(response.user);
      setSuccess(`User found: ${response.user.firstName} ${response.user.lastName}`);
    } catch (err: any) {
      setUserFound(null);
      if (err.response?.status === 404) {
        setError("User with this email not found in the system");
      } else {
        setError(err.response?.data?.message || "Failed to search for user. Please try again.");
      }
      console.error("Error searching for user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!selectedWorkspace || !userFound) {
      setError("Please select a workspace and search for a valid user first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await inviteMembersToWorkspace(selectedWorkspace, [userFound.id]);
      setEmailInput("");
      setUserFound(null);
      setSuccess(`Invitation sent to ${userFound.email} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation. Please try again.");
      console.error("Error inviting member:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/admin/workspaces/${workspaceId}`);
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Workspace Management</h1>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
              Back to Dashboard
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Workspace</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Workspaces</h2>
              {workspaces.length === 0 ? (
                <p className="text-gray-600">No workspaces created yet.</p>
              ) : (
                <div className="space-y-3">
                  {workspaces.map((workspace) => (
                    <div 
                      key={workspace._id} 
                      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleWorkspaceClick(workspace._id)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg">{workspace.name}</h3>
                        <span className="text-sm text-gray-500">
                          {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(workspace.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invite Member to Workspace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Workspace
                </label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite by Email
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter user's email"
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSearchUserByEmail}
                      disabled={loading || !emailInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      Search
                    </button>
                  </div>
                  
                  {userFound && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{userFound.firstName} {userFound.lastName}</p>
                          <p className="text-sm text-gray-600">{userFound.email} ({userFound.role})</p>
                        </div>
                        <button
                          onClick={handleInviteByEmail}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition text-sm"
                        >
                          {loading ? "Inviting..." : "Invite"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WorkspaceManagementPage;