import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("API base URL is not defined in environment variables.");
}

interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  assigneeEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = useCallback((err: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message;
      console.error("API operation failed:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage || defaultMessage);
    } else if (err instanceof Error) {
      console.error("API operation failed (general error):", err.message);
      setError(err.message);
      toast.error(err.message || defaultMessage);
    } else {
      console.error("API operation failed (unknown error):", err);
      setError(defaultMessage);
      toast.error(defaultMessage);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) {
        throw new Error("API base URL is not defined. Cannot fetch tasks.");
      }
      const response = await axios.get(`${API_BASE_URL}/task/get-tasks`);
      setTasks(response.data.tasks);
      return response.data.tasks;
    } catch (err) {
      handleApiError(err, "Failed to fetch tasks.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const createTask = useCallback(
    async (newTask: Omit<Task, "_id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        if (!API_BASE_URL) {
          throw new Error("API base URL is not defined. Cannot create task.");
        }
        const response = await axios.post(
          `${API_BASE_URL}/task/create-task`,
          newTask
        );
        const createdTask = response.data.task;
        setTasks((prevTasks) => [...prevTasks, createdTask]);
        toast.success("Task created successfully!");
        return createdTask;
      } catch (err) {
        handleApiError(err, "Failed to create task.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError]
  );

  const updateTask = useCallback(
    async (id: string, updatedTask: Partial<Task>) => {
      setLoading(true);
      setError(null);
      try {
        if (!API_BASE_URL) {
          throw new Error("API base URL is not defined. Cannot update task.");
        }
        const response = await axios.put(
          `${API_BASE_URL}/task/update-task/${id}`,
          updatedTask
        );
        const returnedTask = response.data.task;
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === id ? returnedTask : task))
        );
        toast.success("Task updated successfully!");
        return returnedTask;
      } catch (err) {
        handleApiError(err, "Failed to update task.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!API_BASE_URL) {
          throw new Error("API base URL is not defined. Cannot delete task.");
        }
        await axios.delete(`${API_BASE_URL}/task/delete-task/${id}`);
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        toast.success("Task deleted successfully!");
        return true;
      } catch (err) {
        handleApiError(err, "Failed to delete task.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError]
  );

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
