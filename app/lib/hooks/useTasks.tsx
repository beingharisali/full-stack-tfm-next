import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import http from "@/services/http";

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
      const response = await http.get("/task/get-tasks");
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
    async (
      newTask: Omit<Task, "_id" | "createdAt" | "updatedAt" | "assignee"> & {
        assigneeEmail?: string;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await http.post("/task/create-task", newTask);
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
    async (
      id: string,
      updatedTask: Partial<Omit<Task, "assignee">> & { assigneeEmail?: string }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await http.put(`/task/update-task/${id}`, updatedTask);
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
        await http.delete(`/task/delete-task/${id}`);
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
