"use client";

import Nav from "@/app/component/Navbar";
import {
  getTasks,
  updateTask,
  Task,
  createTask as createTaskApi,
} from "@/services/task.api";
import React, { useEffect, useState } from "react";
import TaskForm from "@/app/component/TaskForm";
import Modal from "@/app/layouts/layoutTask";
import toast from "react-hot-toast";

function AdminDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);

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
        if (
          task.updatedAt &&
          task.createdAt &&
          new Date(task.updatedAt).getTime() !==
            new Date(task.createdAt).getTime()
        ) {
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
      toast.error("Failed to fetch tasks.");
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
      toast.success("Task status updated!");
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task", error);
      toast.error("Failed to update task status.");
    }
  };

  const handleCreateClick = () => {
    setEditingTask(undefined);
    setShowFormModal(true);
  };

  const handleCancelForm = () => {
    setEditingTask(undefined);
    setShowFormModal(false);
  };

  const handleSaveTask = async (task: Task) => {
    setFormLoading(true);
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeEmail: task.assigneeEmail,
        assigneeName: task.assigneeName,
      };

      if (task._id) {
        await updateTask(task._id, taskData);
        toast.success("Task updated successfully!");
      } else {
        await createTaskApi(taskData);
        toast.success("Task created successfully!");
      }
      setEditingTask(undefined);
      setShowFormModal(false);
      await fetchTasks();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save task";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({
      ...task,
      assigneeEmail: task.assigneeEmail,
      assigneeName: task.assigneeName || "",
    });
    setShowFormModal(true);
  };

  return (
    <>
      <Nav />
      <div className='flex flex-col md:flex-row mx-4 mt-6 gap-6'>
        <Modal
          show={showFormModal}
          onClose={handleCancelForm}>
          <TaskForm
            key={editingTask?._id || "new-task"}
            initialTask={
              editingTask || {
                title: "",
                description: "",
                dueDate: "",
                status: "pending",
                priority: "medium",
                assigneeEmail: "",
                assigneeName: "",
              }
            }
            onSave={handleSaveTask}
            onCancel={handleCancelForm}
            isLoading={formLoading}
          />
        </Modal>

        <div className='md:w-2/3 bg-white shadow-lg rounded-xl p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-3xl font-bold text-gray-800'>Tasks Overview</h2>
            <button
              onClick={handleCreateClick}
              className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out'>
              + Create New Task
            </button>
          </div>

          {loading ? (
            <p className='text-gray-500'>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className='text-gray-500 text-sm'>No tasks available.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr className='bg-blue-600 text-white'>
                    <th className='px-4 py-2 text-left'>ID</th>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Email</th>
                    <th className='px-4 py-2 text-left'>Role</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                    <th className='px-4 py-2 text-left'>Actions</th>
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
                          className={`px-2 py-1 rounded-lg text-white font-semibold text-xs ${
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
                          className={`px-2 py-1 rounded-lg font-semibold border text-sm ${
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
                      <td className='px-4 py-2 text-gray-500 text-xs'>
                        {new Date(task.createdAt!).toLocaleString()}
                      </td>
                      <td className='px-4 py-2'>
                        <button
                          onClick={() => handleEditClick(task)}
                          className='px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition'>
                          Edit
                        </button>
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
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
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
    </>
  );
}

export default AdminDashboardPage;
