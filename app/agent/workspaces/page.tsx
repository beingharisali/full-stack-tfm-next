"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useWorkspaceContext } from "../../../context/WorkspaceContext";
import { getWorkspaceTasks, Task } from "../../../services/task.api";
import ProtectedRoute from "../../../shared/ProtectedRoute";
import { useRouter } from "next/navigation";
import WorkspaceInvitation from "../../../app/component/WorkspaceInvitation";

const AgentWorkspacesPage = () => {
  const { user } = useAuthContext();
  const { workspaces, invitations, loading: workspaceLoading } = useWorkspaceContext();
  const router = useRouter();
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkspaceTasks = async () => {
      if (selectedWorkspace) {
        setLoading(true);
        try {
          const workspaceTasks = await getWorkspaceTasks(selectedWorkspace);
          setTasks(workspaceTasks);
        } catch (error) {
          console.error("Error fetching workspace tasks:", error);
          setTasks([]);
        } finally {
          setLoading(false);
        }
      } else {
        setTasks([]);
      }
    };

    fetchWorkspaceTasks();
  }, [selectedWorkspace]);

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/agent/workspaces/${workspaceId}/tasks`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in progress": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (workspaceLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Workspaces</h1>
            <button
              onClick={() => router.push("/tasks")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
              Back to Tasks
            </button>
          </div>
          
          <WorkspaceInvitation onInvitationResponse={() => {}} />

          {workspaces.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-600">You haven't been added to any workspaces yet.</p>
              <p className="text-gray-500 mt-2">Wait for an administrator to invite you to a workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">Workspaces</h2>
                  <div className="space-y-2">
                    {workspaces.map((workspace) => (
                      <div
                        key={workspace._id}
                        onClick={() => handleWorkspaceClick(workspace._id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedWorkspace === workspace._id
                            ? "bg-blue-100 border border-blue-300"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <h3 className="font-medium">{workspace.name}</h3>
                        <p className="text-sm text-gray-600">
                          {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {selectedWorkspace
                        ? workspaces.find(w => w._id === selectedWorkspace)?.name + " Tasks"
                        : "Select a workspace to view tasks"}
                    </h2>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {selectedWorkspace
                        ? "No tasks found in this workspace."
                        : "Select a workspace to view its tasks."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              <p className="text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority || "")}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3">
                            <div className="text-sm text-gray-500">
                              {task.assigneeName && (
                                <span>Assigned to: {task.assigneeName}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.dueDate && (
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AgentWorkspacesPage;