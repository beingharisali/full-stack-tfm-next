"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "@/hooks/adminHook";
import { updateTask, Task, deleteTask } from "@/services/task.api";
import LoadingSpinner from "@/app/component/LoadingSpinner";

import toast from "react-hot-toast";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const {
    user,
    tasks,
    activityLog,
    loading,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    fetchTasks,
  } = useAdminDashboard();
  const router = useRouter();

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask(taskId, { status });
      toast.success("Task status updated!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task status.");
    }
  };

  const handleEditClick = (task: Task) => {};

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  const chartData = [
    { name: "Total", value: totalTasks },
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
    { name: "Overdue", value: overdueTasks },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row mx-4 mt-6 gap-6">
      <div className="md:w-2/3 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-gray-500 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-700">
              {completedTasks}
            </p>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingTasks}</p>
          </div>

          <div className="bg-red-100 p-4 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Overdue</p>
            <p className="text-2xl font-bold text-red-700">{overdueTasks}</p>
          </div>
        </div>

        <BarChart width={780} height={220} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1D4ED8" />
        </BarChart>
      </div>

      <div className="md:w-1/3 bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Tasks Overview</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push("/tasks")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Tasks
            </button>
            <button
              onClick={() => router.push("/admin/workspaces")}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Manage Spaces
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          Recent Activity
        </h3>

        {activityLog.length === 0 ? (
          <p className="text-gray-500">No recent activity found.</p>
        ) : (
          <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <ul className="space-y-4">
              {activityLog.map((log, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-medium">{log.message}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        log.type === "created"
                          ? "bg-blue-100 text-blue-800"
                          : log.type === "updated"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    {new Date(log.time).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
