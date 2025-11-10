"use client";

import React, { useState, useEffect, useMemo } from "react";
import Nav from "../component/Navbar";
import TaskForm from "../component/TaskForm";
import Pagination from "../component/Pagination";
import { Toaster } from "react-hot-toast";
import { useTasks } from "../lib/hooks/useTasks";

interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?:
    | { _id: string; firstName: string; lastName: string; email: string }
    | string;
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

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchAssignee, setSearchAssignee] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, searchAssignee]);

  const filteredTasks = useMemo(() => {
    const searchTerm = searchAssignee.toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      let matchesAssignee = true;
      if (searchTerm) {
        const assigneeName =
          typeof task.assignee === "object" && task.assignee?.firstName
            ? `${task.assignee.firstName} ${task.assignee.lastName}`.toLowerCase()
            : "";
        const assigneeEmail = task.assigneeEmail?.toLowerCase() || "";

        matchesAssignee =
          assigneeName.includes(searchTerm) ||
          assigneeEmail.includes(searchTerm);
      }
      return matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, filterStatus, filterPriority, searchAssignee]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTasks.length / tasksPerPage);
  }, [filteredTasks.length, tasksPerPage]);

  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredTasks, currentPage, tasksPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSaveTask = async (task: Task) => {
    setFormLoading(true);
    let result;
    if (task._id) {
      result = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeEmail: task.assigneeEmail,
      });
    } else {
      result = await createTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeEmail: task.assigneeEmail,
      });
    }

    if (result) {
      setEditingTask(undefined);
      setShowForm(false);
      await fetchTasks();
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
      await fetchTasks();
      if (
        currentPage > Math.ceil((filteredTasks.length - 1) / tasksPerPage) &&
        currentPage > 1
      ) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingTask(undefined);
    setShowForm(false);
  };

  const getPriorityTagStyle = (priority?: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster />
      <Nav />
      <div className="container mx-auto p-6 md:p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
          TaskFlow Management
        </h1>

        <button
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
          className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-1"
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

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Filter Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="filterStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="filterStatus"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={tasksLoading || formLoading}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filterPriority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority
              </label>
              <select
                id="filterPriority"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                disabled={tasksLoading || formLoading}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="searchAssignee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assignee Search
              </label>
              <input
                type="text"
                id="searchAssignee"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                placeholder="Search by name or email"
                value={searchAssignee}
                onChange={(e) => setSearchAssignee(e.target.value)}
                disabled={tasksLoading || formLoading}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">My Tasks</h2>
          {filteredTasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No tasks match your current filters. Try adjusting them!
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {currentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="mb-3 md:mb-0 md:w-3/4">
                      <h3 className="text-xl font-bold text-gray-900 leading-snug">
                        {task.title}
                      </h3>
                      <p className="text-gray-700 mt-1 text-sm">
                        {task.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                        </span>
                        {task.priority && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityTagStyle(
                              task.priority
                            )}`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </span>
                        )}
                        {(task.assignee || task.assigneeEmail) && (
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              ></path>
                            </svg>
                            Assignee:{" "}
                            {task.assignee &&
                            typeof task.assignee === "object" &&
                            "firstName" in task.assignee
                              ? `${task.assignee.firstName} ${task.assignee.lastName}`
                              : task.assigneeEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-3 md:mt-0">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id!)}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={tasksLoading || formLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
