"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Edit3 } from "lucide-react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeEmail: string;
  assigneeName?: string;
  workspace?: string; 
}

interface TaskFormProps {
  initialTask: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { workspaces } = useWorkspaceContext();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(
    initialTask?.description || ""
  );
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || "");
  const [status, setStatus] = useState<Task["status"]>(
    initialTask?.status || "pending"
  );
  const [priority, setPriority] = useState<Task["priority"]>(
    initialTask?.priority || "medium"
  );
  const [assigneeEmail, setAssigneeEmail] = useState(
    initialTask?.assigneeEmail || ""
  );
  const [assigneeName, setAssigneeName] = useState(
    initialTask?.assigneeName || ""
  );
  const [workspace, setWorkspace] = useState(initialTask?.workspace || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle(initialTask?.title || "");
    setDescription(initialTask?.description || "");
    setDueDate(initialTask?.dueDate || "");
    setStatus(initialTask?.status || "pending");
    setPriority(initialTask?.priority || "medium");
    setAssigneeEmail(initialTask?.assigneeEmail || "");
    setAssigneeName(initialTask?.assigneeName || "");
    setWorkspace(initialTask?.workspace || "");
    setErrors({});
  }, [initialTask]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!dueDate) newErrors.dueDate = "Due Date is required.";
    if (!assigneeEmail.trim())
      newErrors.assigneeEmail = "Assignee Email is required.";
    else if (!/\S+@\S+\.\S+/.test(assigneeEmail))
      newErrors.assigneeEmail = "Invalid email format.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const taskToSave: Task = {
        title,
        description,
        dueDate,
        status,
        priority,
        assigneeEmail,
        assigneeName,
        workspace: workspace || undefined, 
      };
      if (initialTask?._id) taskToSave._id = initialTask._id;
      onSave(taskToSave);
    } else {
      toast.error("Please correct the errors in the form.");
    }
  };

  const formTitle = initialTask?._id ? "Edit Task" : "Add New Task";
  const submitButtonText = initialTask?._id ? "Update Task" : "Create Task";

  return (
    <div className="bg-white rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        {initialTask?._id ? (
          <Edit3 className="w-6 h-6 text-blue-600" />
        ) : (
          <Plus className="w-6 h-6 text-blue-600" />
        )}
        <h2 className="text-2xl font-bold text-gray-800">{formTitle}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            className={`w-full px-4 py-3 border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full px-4 py-3 border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            placeholder="Enter task description"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            className={`w-full px-4 py-3 border ${
              errors.dueDate ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
              disabled={isLoading}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="workspace"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Workspace
            </label>
            <select
              id="workspace"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              disabled={isLoading || workspaces.length === 0}
            >
              <option value="">No workspace</option>
              {workspaces.map((ws) => (
                <option key={ws._id} value={ws._id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="assigneeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assignee Name
          </label>
          <input
            type="text"
            id="assigneeName"
            className={`w-full px-4 py-3 border ${
              errors.assigneeName ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
            disabled={isLoading}
            placeholder="John Doe"
          />
          {errors.assigneeName && (
            <p className="mt-1 text-xs text-red-600">{errors.assigneeName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="assigneeEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assignee Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="assigneeEmail"
            className={`w-full px-4 py-3 border ${
              errors.assigneeEmail ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={assigneeEmail}
            onChange={(e) => setAssigneeEmail(e.target.value)}
            disabled={isLoading}
            placeholder="user@example.com"
            required
          />
          {errors.assigneeEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.assigneeEmail}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;