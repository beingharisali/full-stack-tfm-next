"use client";
import React, { useState } from "react";
import Nav from "../component/Navbar";
import TaskForm from "../component/TaskForm";
import { Toaster, toast } from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const currentTasks = tasks.slice(startIndex, startIndex + tasksPerPage);

  const handleSaveTask = async (task: Task) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (task.id) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toast.success("Task updated successfully!");
    } else {
      const newTask = { ...task, id: Date.now().toString() };
      setTasks((prev) => [...prev, newTask]);
      toast.success("Task added successfully!");
    }

    setEditingTask(undefined);
    setShowForm(false);
    setIsLoading(false);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted successfully!");
    }
  };

  const handleCancelForm = () => {
    setEditingTask(undefined);
    setShowForm(false);
  };

  // ✅ Pagination controls
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);

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
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Task
        </button>

        {showForm && (
          <TaskForm
            initialTask={editingTask}
            onSave={handleSaveTask}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Tasks</h2>

          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks yet. Add a new one!</p>
          ) : (
            <>
              {/* ✅ Paginated task list */}
              <ul className="space-y-4">
                {currentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-gray-700">{task.description}</p>
                      <p className="text-sm text-gray-500">
                        Due: {task.dueDate} | Status:{" "}
                        <span
                          className={`font-medium ${
                            task.status === "completed"
                              ? "text-green-600"
                              : task.status === "in-progress"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                        </span>
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
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* ✅ Pagination Controls */}
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageClick(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
