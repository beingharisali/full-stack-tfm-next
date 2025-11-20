"use client";

import Nav from "@/app/component/Navbar";
import { getTasks, updateTask, Task } from "@/services/task.api";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTasks() {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);

      const logs: any[] = [];

      fetchedTasks.forEach((task: Task) => {
        logs.push({
          message: `Task "${task.title}" was created by ${task.assigneeName}`,
          time: task.createdAt,
          type: "created",
        });

        if (task.updatedAt !== task.createdAt) {
          logs.push({
            message: `Task "${task.title}" was updated by ${task.assigneeName} and status changed to "${task.status}"`,
            time: task.updatedAt,
            type: "updated",
          });
        }
      });

      logs.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setActivityLog(logs.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Nav />

      <div className='flex flex-col md:flex-row mx-4 mt-6 gap-6'>
        <div className='md:w-2/3 bg-white shadow-lg rounded-xl p-6'>
          <h2 className='text-3xl font-bold text-gray-800 mb-4'>
            Tasks Overview
          </h2>

          {loading ? (
            <p className='text-gray-500'>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className='text-gray-500 text-sm'>No tasks available.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr className='bg-blue-600 text-white'>
                    <th className='px-4 py-2 text-left'>Title</th>
                    <th className='px-4 py-2 text-left'>Assignee</th>
                    <th className='px-4 py-2 text-left'>Priority</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                    <th className='px-4 py-2 text-left'>Created At</th>
                    <th className='px-4 py-2 text-left'>Updated At</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      className='hover:bg-gray-50 transition'>
                      <td className='px-4 py-2 text-gray-800'>{task.title}</td>
                      <td className='px-4 py-2 text-gray-600'>
                        {task.assigneeName}
                      </td>
                      <td className='px-4 py-2'>
                        <span
                          className={`px-2 py-1 rounded-lg text-white font-semibold ${
                            task.priority === "urgent"
                              ? "bg-red-600"
                              : task.priority === "high"
                              ? "bg-orange-500"
                              : task.priority === "medium"
                              ? "bg-blue-600"
                              : "bg-green-600"
                          }`}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td className='px-4 py-2'>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task._id!,
                              e.target.value as Task["status"]
                            )
                          }
                          className={`px-2 py-1 rounded-lg font-semibold border ${
                            task.status === "completed"
                              ? "bg-green-100 border-green-400 text-green-700"
                              : task.status === "pending"
                              ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                              : "bg-blue-100 border-blue-400 text-blue-700"
                          }`}>
                          <option value='pending'>Pending</option>
                          <option value='in progress'>In Progress</option>
                          <option value='completed'>Completed</option>
                        </select>
                      </td>
                      <td className='px-4 py-2 text-gray-500 text-sm'>
                        {new Date(task.createdAt!).toLocaleString()}
                      </td>
                      <td className='px-4 py-2 text-gray-500 text-sm'>
                        {new Date(task.updatedAt!).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className='md:w-1/3 bg-white shadow-lg rounded-xl p-6'>
          <h2 className='text-3xl font-bold text-gray-800 mb-4'>
            Activity Log
          </h2>
          {activityLog.length === 0 ? (
            <p className='text-gray-500 text-sm'>No recent activity found.</p>
          ) : (
            <div className='space-y-4'>
              {activityLog.map((activity, index) => (
                <div
                  key={index}
                  className='p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer'>
                  <div className='flex justify-between items-center mb-1'>
                    <span
                      className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                        activity.type === "created"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                      {activity.type.toUpperCase()}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {new Date(activity.time).toLocaleString()}
                    </span>
                  </div>
                  <p className='text-gray-800 text-sm'>{activity.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminDashboardPage;