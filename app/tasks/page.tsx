"use client";

import React, { useState, useEffect, useMemo } from "react";
import Nav from "../component/Navbar";
import TaskForm from "../component/TaskForm";
import Pagination from "../component/Pagination";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Modal from "../layouts/layoutTask";
import {
  Task,
  getTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from "@/services/task.api";
import ProtectedRoute from "@/shared/ProtectedRoute";
import { ArrowLeft, ArrowUp, Plus, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  const fetchTasks = async () => {
    setTasksLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch tasks";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, searchQuery]);

  const getAssigneeDisplay = (task: Task) => {
    if (task.assigneeName) {
      return task.assigneeName;
    }
    return task.assigneeEmail || "Unassigned";
  };

  const filteredTasks = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return tasks.filter((task: Task) => {
      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      let matchesSearch = true;
      if (term) {
        const assigneeName = task.assigneeName?.toLowerCase() || "";
        const assigneeEmail = task.assigneeEmail?.toLowerCase() || "";
        const taskTitle = task.title.toLowerCase();
        const taskDescription = task.description.toLowerCase();

        matchesSearch =
          assigneeName.includes(term) ||
          assigneeEmail.includes(term) ||
          taskTitle.includes(term) ||
          taskDescription.includes(term);
      }
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, searchQuery]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTasks.length / tasksPerPage);
  }, [filteredTasks.length, tasksPerPage]);

  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredTasks, currentPage, tasksPerPage]);

  const kanbanColumns = useMemo(() => {
    return {
      pending: filteredTasks.filter((task: Task) => task.status === "pending"),
      "in progress": filteredTasks.filter(
        (task: Task) => task.status === "in progress"
      ),
      completed: filteredTasks.filter(
        (task: Task) => task.status === "completed"
      ),
    };
  }, [filteredTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: "pending" | "in progress" | "completed"
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t: Task) => t._id === taskId);
    if (task && task.status !== newStatus) {
      try {
        await updateTaskApi(taskId, { ...task, status: newStatus });
        await fetchTasks();
        toast.success("Task updated successfully!");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update task");
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSaveTask = async (task: Task) => {
    setFormLoading(true);
    try {
      if (task._id) {
        await updateTaskApi(task._id, {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          assigneeEmail: task.assigneeEmail,
          assigneeName: task.assigneeName,
        });
        toast.success("Task updated successfully!");
      } else {
        await createTaskApi({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          assigneeEmail: task.assigneeEmail,
          assigneeName: task.assigneeName,
        });
        toast.success("Task created successfully!");
      }
      setEditingTask(undefined);
      setShowFormModal(false);
      await fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save task");
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

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setFormLoading(true);
      try {
        await deleteTaskApi(id);
        toast.success("Task deleted successfully!");
        await fetchTasks();
        if (
          currentPage > Math.ceil((filteredTasks.length - 1) / tasksPerPage) &&
          currentPage > 1
        ) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete task");
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingTask(undefined);
    setShowFormModal(false);
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (tasksLoading && tasks.length === 0) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
            <p className='text-gray-700 text-lg mt-4'>Loading tasks...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
          <div className='bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-2'>
              Error Loading Tasks
            </h3>
            <p className='text-red-600 text-lg mb-6'>{error}</p>
            <button
              onClick={fetchTasks}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans'>
        <Toaster />
        <Nav />
        <div className='container mx-auto p-4 md:p-6'>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className='flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors'>
            <ArrowLeft className='mr-2' />
            Back
          </button>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-0'>
              TaskFlow Management
            </h1>

            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='relative'>
                <select
                  id='filterStatus'
                  className='pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 appearance-none'
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  disabled={tasksLoading || formLoading}>
                  <option value='all'>All Statuses</option>
                  <option value='pending'>Pending</option>
                  <option value='in progress'>In Progress</option>
                  <option value='completed'>Completed</option>
                </select>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>

              <div className='relative'>
                <select
                  id='filterPriority'
                  className='pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 appearance-none'
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  disabled={tasksLoading || formLoading}>
                  <option value='all'>All Priorities</option>
                  <option value='low'>Low</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                  <option value='urgent'>Urgent</option>
                </select>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>

              <div className='relative'>
                <input
                  type='text'
                  id='searchQuery'
                  className='pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 w-full'
                  placeholder='Search tasks...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={tasksLoading || formLoading}
                />
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTask(undefined);
              setShowFormModal(true);
            }}
            className='mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105'>
            <Plus className='w-5 h-5' />
            Add New Task
          </button>

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

          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-800'>My Tasks</h2>
              <div className='flex gap-2'>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`p-2 rounded-lg transition duration-300 ${
                    viewMode === "kanban"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title='Kanban View'>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition duration-300 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title='List View'>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 6h16M4 10h16M4 14h16M4 18h16'
                    />
                  </svg>
                </button>
              </div>
            </div>
            {filteredTasks.length === 0 ? (
              <div className='text-center py-12'>
                <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'></path>
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                  No Tasks Found
                </h3>
                <p className='text-gray-500 mb-6'>
                  No tasks match your current filters. Try adjusting them!
                </p>
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setSearchQuery("");
                  }}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "kanban" ? (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6'>
                <div
                  className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 h-[500px] overflow-y-auto shadow-inner'
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "pending")}>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                      <span className='w-3 h-3 bg-red-500 rounded-full mr-2'></span>
                      Pending
                    </h3>
                    <span className='bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                      {kanbanColumns.pending.length}
                    </span>
                  </div>
                  <div className='space-y-4'>
                    {kanbanColumns.pending.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id!)}
                        className='bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-move'>
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-bold text-gray-900 text-lg'>
                            {task.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityTagStyle(
                              task.priority
                            )}`}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Not Set'}
                          </span>
                        </div>
                        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                          {task.description || 'No description provided'}
                        </p>
                        <div className='flex flex-wrap gap-2 mb-4'>
                          <span className='text-xs text-gray-500 flex items-center'>
                            <svg
                              className='w-3 h-3 mr-1'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {(task.assigneeName || task.assigneeEmail) && (
                            <span className='text-xs text-gray-500 flex items-center'>
                              <svg
                                className='w-3 h-3 mr-1'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                              </svg>
                              {getAssigneeDisplay(task)}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditClick(task)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-yellow-600 hover:to-amber-600 transition'>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id!)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition'>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 h-[500px] overflow-y-auto shadow-inner'
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "in progress")}>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                      <span className='w-3 h-3 bg-blue-500 rounded-full mr-2'></span>
                      In Progress
                    </h3>
                    <span className='bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                      {kanbanColumns["in progress"].length}
                    </span>
                  </div>
                  <div className='space-y-4'>
                    {kanbanColumns["in progress"].map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id!)}
                        className='bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-move'>
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-bold text-gray-900 text-lg'>
                            {task.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityTagStyle(
                              task.priority
                            )}`}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Not Set'}
                          </span>
                        </div>
                        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                          {task.description || 'No description provided'}
                        </p>
                        <div className='flex flex-wrap gap-2 mb-4'>
                          <span className='text-xs text-gray-500 flex items-center'>
                            <svg
                              className='w-3 h-3 mr-1'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {(task.assigneeName || task.assigneeEmail) && (
                            <span className='text-xs text-gray-500 flex items-center'>
                              <svg
                                className='w-3 h-3 mr-1'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                              </svg>
                              {getAssigneeDisplay(task)}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditClick(task)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-yellow-600 hover:to-amber-600 transition'>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id!)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition'>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 h-[500px] overflow-y-auto shadow-inner'
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "completed")}>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                      <span className='w-3 h-3 bg-green-500 rounded-full mr-2'></span>
                      Completed
                    </h3>
                    <span className='bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                      {kanbanColumns.completed.length}
                    </span>
                  </div>
                  <div className='space-y-4'>
                    {kanbanColumns.completed.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id!)}
                        className='bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-move'>
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-bold text-gray-900 text-lg'>
                            {task.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityTagStyle(
                              task.priority
                            )}`}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Not Set'}
                          </span>
                        </div>
                        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                          {task.description || 'No description provided'}
                        </p>
                        <div className='flex flex-wrap gap-2 mb-4'>
                          <span className='text-xs text-gray-500 flex items-center'>
                            <svg
                              className='w-3 h-3 mr-1'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {(task.assigneeName || task.assigneeEmail) && (
                            <span className='text-xs text-gray-500 flex items-center'>
                              <svg
                                className='w-3 h-3 mr-1'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                              </svg>
                              {getAssigneeDisplay(task)}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditClick(task)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-yellow-600 hover:to-amber-600 transition'>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id!)}
                            className='flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition'>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className='space-y-4 p-6'>
                  {currentTasks.map((task) => (
                    <div
                      key={task._id}
                      className='flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300'>
                      <div className='mb-3 md:mb-0 md:w-3/4'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-xl font-bold text-gray-900'>
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityTagStyle(
                              task.priority
                            )}`}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Not Set'}
                          </span>
                        </div>
                        <p className='text-gray-700 mt-1 text-sm'>
                          {task.description || 'No description provided'}
                        </p>
                        <div className='mt-3 flex flex-wrap items-center gap-3 text-sm'>
                          <span className='flex items-center text-gray-500'>
                            <svg
                              className='w-4 h-4 mr-1'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              xmlns='http://www.w3.org/2000/svg'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                            </svg>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusTagStyle(
                              task.status
                            )}`}>
                            {task.status.charAt(0).toUpperCase() +
                              task.status.slice(1)}
                          </span>
                          {(task.assigneeName || task.assigneeEmail) && (
                            <span className='flex items-center text-gray-500'>
                              <svg
                                className='w-4 h-4 mr-1'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                              </svg>
                              Assignee: {getAssigneeDisplay(task)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='flex space-x-3 mt-3 md:mt-0'>
                        <button
                          onClick={() => handleEditClick(task)}
                          className='px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-yellow-600 hover:to-amber-600 transition'>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id!)}
                          className='px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition'>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 0 && (
                  <div className='p-6 border-t border-gray-200'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isLoading={tasksLoading || formLoading}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 z-50'
          aria-label='Scroll to top'>
          <ArrowUp className='w-6 h-6' />
        </button>
      </div>
    </ProtectedRoute>
  );
}
