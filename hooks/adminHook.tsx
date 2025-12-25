"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "./authHook";
import { getTasks, updateTask, Task, deleteTask } from "../services/task.api";
import toast from "react-hot-toast";

export const useAdminTasks = () => {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error("Failed to fetch tasks.");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask(taskId, { status });
      toast.success("Task status updated!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task status.");
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task.");
      console.error("Error deleting task:", error);
    }
  };

  return {
    user,
    tasks,
    loading,
    fetchTasks,
    handleStatusChange,
    handleDeleteTask
  };
};

export const useAdminDashboard = () => {
  const { user, tasks, loading, fetchTasks } = useAdminTasks();
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      let completed = tasks.filter(
        (t) => t.status === "completed"
      ).length;
      let pending = tasks.filter((t) => t.status !== "completed").length;
      let overdue = tasks.filter(
        (t) =>
          t.status !== "completed" &&
          new Date(t.dueDate).getTime() < new Date().getTime()
      ).length;

      setTotalTasks(tasks.length);
      setCompletedTasks(completed);
      setPendingTasks(pending);
      setOverdueTasks(overdue);

      const logs: any[] = [];
      tasks.forEach((task: Task) => {
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
            message: `Task "${task.title}" was updated by ${user?.firstName} and status changed to "${task.status}"`,
            time: task.updatedAt,
            type: "updated",
          });
        }
      });

      logs.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setActivityLog(logs.slice(0, 10));
    }
  }, [tasks, user]);

  return {
    user,
    tasks,
    activityLog,
    loading,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    fetchTasks
  };
};