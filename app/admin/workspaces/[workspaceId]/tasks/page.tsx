"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../../shared/ProtectedRoute";
import { getWorkspaceTasks, getWorkspaceById } from "../../../../../services/workspace.api";
import { createTask, updateTask, deleteTask, Task } from "../../../../../services/task.api";
import TaskForm from "../../../../../app/component/TaskForm";
import ChatWidget from "../../../../../app/component/ChatWidget";

interface Workspace {
  _id: string;
  name: string;
  members: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const WorkspaceTaskManagementPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workspaceData = await getWorkspaceById(workspaceId);
        setWorkspace(workspaceData);
        
        const workspaceTasks = await getWorkspaceTasks(workspaceId);
        setTasks(workspaceTasks);
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

  const handleCreateTask = async (taskData: Task) => {
    try {
      const { workspace, ...taskWithoutWorkspace } = taskData;
      const newTask = await createTask({
        ...taskWithoutWorkspace,
        workspace: workspaceId
      } as Omit<Task, "_id" | "createdAt" | "updatedAt">);
      
      setTasks([...tasks, newTask]);
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (taskData: Task) => {
    try {
      if (!taskData._id) return;
      
      const { workspace, ...taskWithoutWorkspace } = taskData;
      const updatedTask = await updateTask(taskData._id, taskWithoutWorkspace as Partial<Omit<Task, "_id" | "createdAt" | "updatedAt">>);
      setTasks(tasks.map(task => task._id === taskData._id ? updatedTask : task));
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
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
                {workspace ? workspace.name : "Workspace Tasks"}
              </h1>
              <p className="text-gray-600">Manage tasks for this workspace</p>
            </div>
            <button
              onClick={() => router.push("/admin/workspaces")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
              Back to Workspaces
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                Create New Task
              </button>
            </div>
            
            {showTaskForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <TaskForm
                  initialTask={editingTask || { 
                    title: "", 
                    description: "", 
                    dueDate: "", 
                    status: "pending", 
                    priority: "medium", 
                    assigneeEmail: "", 
                    assigneeName: "",
                    workspace: workspaceId
                  }}
                  onSave={editingTask ? handleUpdateTask : handleCreateTask}
                  onCancel={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                  }}
                />
              </div>
            )}
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found in this workspace. Create a new task to get started.
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
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id!)}
                            className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
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
      <ChatWidget />
    </ProtectedRoute>
  );
};

export default WorkspaceTaskManagementPage;