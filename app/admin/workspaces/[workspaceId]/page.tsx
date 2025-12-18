"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../shared/ProtectedRoute";
import { 
  getWorkspaceById, 
  getWorkspaceTasks, 
  inviteMembersToWorkspace,
  leaveWorkspace
} from "../../../../services/workspace.api";
import { 
  getAllUsers, 
  getUserByEmail 
} from "../../../../services/auth.api";
import { Task } from "../../../../services/task.api";
import TaskForm from "../../../../app/component/TaskForm";

interface Workspace {
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const WorkspaceDetailsPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [emailInput, setEmailInput] = useState("");
  const [userFound, setUserFound] = useState<User | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const workspaceData = await getWorkspaceById(workspaceId);
        setWorkspace(workspaceData);
        setSelectedWorkspace(workspaceId);
        
        const workspaceTasks = await getWorkspaceTasks(workspaceId);
        setTasks(workspaceTasks);
        
        const usersResponse = await getAllUsers();
        setUsers(usersResponse.users);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch workspace data");
        console.error("Error fetching workspace data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchData();
    }
  }, [workspaceId]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      router.push(`/admin/workspaces/${workspaceId}/tasks`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      router.push(`/admin/workspaces/${workspaceId}/tasks`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      router.push(`/admin/workspaces/${workspaceId}/tasks`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleEditClick = (task: Task) => {
    router.push(`/admin/workspaces/${workspaceId}/tasks`);
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
      
      const updatedWorkspace = await getWorkspaceById(workspaceId);
      setWorkspace(updatedWorkspace);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation. Please try again.");
      console.error("Error inviting member:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!workspace) return;
    
    if (!confirm("Are you sure you want to leave this workspace?")) return;

    try {
      await leaveWorkspace(workspaceId);
      setSuccess("Successfully left the workspace");
      router.push("/admin/workspaces");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to leave workspace");
      console.error("Error leaving workspace:", err);
    }
  };

  const getStatusTagStyle = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityTagStyle = (priority?: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {workspace ? workspace.name : "Workspace Details"}
              </h1>
              <p className="text-gray-600">Manage this workspace</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/admin/workspaces/${workspaceId}/tasks`)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                Manage Tasks
              </button>
              <button
                onClick={() => router.push("/admin/workspaces")}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                Back to Workspaces
              </button>
            </div>
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Workspace Information</h2>
              
              {workspace && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Name</h3>
                    <p className="text-gray-900">{workspace.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Created By</h3>
                    <p className="text-gray-900">
                      {workspace.createdBy === user?.id ? "You" : "Another admin"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Created On</h3>
                    <p className="text-gray-900">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Members ({workspace.members.length})</h3>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {workspace.members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-600">{member.email} ({member.role})</p>
                          </div>
                          {member._id === workspace.createdBy && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Owner
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invite Members</h2>
              
              <div className="space-y-4">
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
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLeaveWorkspace}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition">
                    Leave Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Recent Tasks</h2>
              <button
                onClick={() => router.push(`/admin/workspaces/${workspaceId}/tasks`)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                View All Tasks
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found in this workspace.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.slice(0, 5).map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.assigneeName || "Unassigned"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.assigneeEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusTagStyle(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityTagStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WorkspaceDetailsPage;