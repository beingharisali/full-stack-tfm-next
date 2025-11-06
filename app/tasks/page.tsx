"use client";

import React, { useState, useEffect } from "react";
import Nav from "../component/Navbar";
import TaskForm from "../component/TaskForm";
import { Toaster } from "react-hot-toast";
import { useTasks } from "../lib/hooks/useTasks";

interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  assigneeEmail?: string;
}

export default function TasksPage() {
  const {
    tasks,
    loading: tasksLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask: deleteTaskApi,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async (task: Task) => {
    setFormLoading(true);
    let result;
    if (task._id) {
      result = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        assigneeEmail: task.assigneeEmail,
      });
    } else {
      result = await createTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        assigneeEmail: task.assigneeEmail,
      });
    }

    if (result) {
      setEditingTask(undefined);
      setShowForm(false);
    }
    setFormLoading(false);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setFormLoading(true);
      await deleteTaskApi(id);
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setEditingTask(undefined);
    setShowForm(false);
  };

  if (tasksLoading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <Nav />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Task Management
        </h1>

        <button
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Task
        </button>

        {showForm && (
          <TaskForm
            key={editingTask?._id || "new-task"}
            initialTask={editingTask}
            onSave={handleSaveTask}
            onCancel={handleCancelForm}
            isLoading={formLoading}
          />
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks yet. Add a new one!</p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-gray-700">{task.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()} |
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          task.status === "completed"
                            ? "text-green-600"
                            : task.status === "in progress"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </span>
                      {task.assigneeEmail && (
                        <span> | Assignee: {task.assigneeEmail}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id!)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
