"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeEmail?: string;
}

interface TaskFormProps {
  initialTask?: Task;
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
  const [assigneeEmail, setAssigneeEmail] = useState(
    initialTask?.assigneeEmail || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!dueDate) newErrors.dueDate = "Due Date is required.";
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
        assigneeEmail,
      };
      if (initialTask?.id) taskToSave.id = initialTask.id;
      onSave(taskToSave);
    } else {
      toast.error("Please correct the errors in the form.");
    }
  };

  const formTitle = initialTask ? "Edit Task" : "Add New Task";
  const submitButtonText = initialTask ? "Update Task" : "Create Task";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto my-8">
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
            <option value="in progress">In Progress</option>{" "}
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="assigneeEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Assignee Email
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
