"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeEmail: string;
  assigneeName?: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle(initialTask?.title || "");
    setDescription(initialTask?.description || "");
    setDueDate(initialTask?.dueDate || "");
    setStatus(initialTask?.status || "pending");
    setPriority(initialTask?.priority || "medium");
    setAssigneeEmail(initialTask?.assigneeEmail || "");
    setAssigneeName(initialTask?.assigneeName || "");
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
    <div className="bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{formTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700"
          >
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.dueDate ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
            className="block text-sm font-medium text-gray-700"
          >
            Priority
          </label>
          <select
            id="priority"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
            htmlFor="assigneeName"
            className="block text-sm font-medium text-gray-700"
          >
            Assignee Name
          </label>
          <input
            type="text"
            id="assigneeName"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.assigneeName ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
            className="block text-sm font-medium text-gray-700"
          >
            Assignee Email
            <span className="text-red-500">*</span>{" "}
          </label>
          <input
            type="email"
            id="assigneeEmail"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.assigneeEmail ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
