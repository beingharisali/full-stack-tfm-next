"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../hooks/authHook";
import { useWorkspaceContext } from "../../../hooks/workspaceHook";
import { getWorkspaceTasks, Task } from "../../../services/task.api";
import { useRouter } from "next/navigation";

const UserWorkspacesPage = () => {
  const { user } = useAuthContext();
  const { workspaces, loading: workspaceLoading } = useWorkspaceContext();
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
    router.push(`/user/workspaces/${workspaceId}/tasks`);
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Workspaces</h1>
              <p className="text-gray-600 mt-2">Access and manage your workspaces</p>
            </div>
            <button
              onClick={() => router.push("/tasks")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Tasks
            </button>
          </div>

          {workspaces.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Workspaces Yet</h3>
              <p className="text-gray-600 mb-4">You haven't been added to any workspaces yet.</p>
              <p className="text-gray-500">Wait for an administrator to add you to a workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Workspaces</h2>
                  </div>
                  <div className="space-y-3">
                    {workspaces.map((workspace) => (
                      <div
                        key={workspace._id}
                        onClick={() => handleWorkspaceClick(workspace._id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedWorkspace === workspace._id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
                            : "hover:bg-blue-50 border border-gray-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedWorkspace === workspace._id ? "bg-blue-600" : "bg-blue-100"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${selectedWorkspace === workspace._id ? "text-white" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h3 className={`font-semibold ${selectedWorkspace === workspace._id ? "text-white" : "text-gray-800"}`}>{workspace.name}</h3>
                            <p className={`text-sm ${selectedWorkspace === workspace._id ? "text-blue-100" : "text-gray-600"}`}>
                              {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedWorkspace
                        ? workspaces.find(w => w._id === selectedWorkspace)?.name + " Tasks"
                        : "Select a workspace to view tasks"}
                    </h2>
                    {selectedWorkspace && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v12a2 2 0 00-2 2m-2-2v-2a2 2 0 00-2-2H5" />
                        </svg>
                        <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-600">Loading tasks...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v12a2 2 0 00-2 2m-2-2v-2a2 2 0 00-2-2H5" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Tasks Found</h3>
                      <p className="text-gray-500">
                        {selectedWorkspace
                          ? "No tasks found in this workspace."
                          : "Select a workspace to view its tasks."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300 bg-gradient-to-r from-white to-gray-50">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v12a2 2 0 00-2 2m-2-2v-2a2 2 0 00-2-2H5" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                                  <p className="text-gray-600 mt-1">{task.description}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                {task.assigneeName && (
                                  <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Assigned to: {task.assigneeName}</span>
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority || "")}`}>
                                {task.priority}
                              </span>
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
    </>
  );
};

export default UserWorkspacesPage;