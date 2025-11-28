"use client";

import Nav from "@/app/component/Navbar";
import {
  getTasks,
  updateTask,
  Task,
  createTask as createTaskApi,
  deleteTask,
} from "@/services/task.api";
import React, { useEffect, useState } from "react";

import TaskForm from "@/app/component/TaskForm";
import Modal from "@/app/layouts/layoutTask";
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

function AdminDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  async function fetchTasks() {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);

      let completed = fetchedTasks.filter(
        (t) => t.status === "completed"
      ).length;
      let pending = fetchedTasks.filter((t) => t.status !== "completed").length;
      let overdue = fetchedTasks.filter(
        (t) =>
          t.status !== "completed" &&
          new Date(t.dueDate).getTime() < new Date().getTime()
      ).length;

      setTotalTasks(fetchedTasks.length);
      setCompletedTasks(completed);
      setPendingTasks(pending);
      setOverdueTasks(overdue);

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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
      toast.error("Failed to delete task.");
    }
  };

  const chartData = [
    { name: "Total", value: totalTasks },
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
    { name: "Overdue", value: overdueTasks },
  ];

  return (
    <>
      <Nav />

      <div className="flex flex-col md:flex-row mx-4 mt-6 gap-6">
        {/* Modal for Task Form */}
        <Modal show={showFormModal} onClose={handleCancelForm}>
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

        {/* Analytics */}
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
              <p className="text-2xl font-bold text-yellow-700">
                {pendingTasks}
              </p>
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

        {/* Activity Log + Create Task */}
        <div className="md:w-1/3 bg-white shadow-lg rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Tasks Overview</h2>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              New Task
            </button>
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
                      <p className="text-gray-800 font-medium">
                        {log.message}
                      </p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          log.type === "created"
                            ? "bg-blue-100 text-blue-800"
                            : log.type === "updated"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.type.charAt(0).toUpperCase() +
                          log.type.slice(1)}
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
    </>
  );
}

export default AdminDashboardPage;
