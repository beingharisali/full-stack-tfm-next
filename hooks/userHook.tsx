"use client";

import { useState, useEffect } from "react";
import { getTasks, Task } from "../services/task.api";

export const useUserDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completedToday: 0,
    overdue: 0
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
        
        const total = fetchedTasks.length;
        const pending = fetchedTasks.filter(task => task.status === "pending").length;
        const inProgress = fetchedTasks.filter(task => task.status === "in progress").length;
        const completed = fetchedTasks.filter(task => task.status === "completed").length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedToday = fetchedTasks.filter(task => {
          if (task.status !== "completed" || !task.updatedAt) return false;
          const completedDate = new Date(task.updatedAt);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        }).length;
        
        const overdue = fetchedTasks.filter(task => {
          if (task.status === "completed" || !task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < new Date();
        }).length;
        
        setStats({
          total,
          pending,
          inProgress,
          completed,
          completedToday,
          overdue
        });
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    stats
  };
};