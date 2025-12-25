"use client";

import { useState, useEffect } from "react";
import { getTasks, Task } from "../services/task.api";

export const useAgentDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    recentActivities: 0
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
        
        const totalTasks = fetchedTasks.length;
        const pendingTasks = fetchedTasks.filter(task => task.status === "pending").length;
        const inProgressTasks = fetchedTasks.filter(task => task.status === "in progress").length;
        const completedTasks = fetchedTasks.filter(task => task.status === "completed").length;
        
        const overdueTasks = fetchedTasks.filter(task => {
          if (task.status === "completed" || !task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < new Date();
        }).length;
        
        setStats({
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
          recentActivities: 0
        });
        
        const logs: any[] = [];
        
        fetchedTasks.forEach((task: Task) => {
          if (task.createdAt) {
            logs.push({
              id: `${task._id}-created`,
              message: `Task "${task.title}" was created`,
              user: task.assigneeName || "Unknown User",
              role: "user",
              time: task.createdAt,
              type: "created",
              taskId: task._id
            });
          }
          
          if (task.updatedAt && task.updatedAt !== task.createdAt) {
            let statusText = "";
            switch (task.status) {
              case "pending": statusText = "moved to pending"; break;
              case "in progress": statusText = "started working on"; break;
              case "completed": statusText = "completed"; break;
              default: statusText = `changed status to ${task.status}`;
            }
            
            logs.push({
              id: `${task._id}-updated`,
              message: `Task "${task.title}" was ${statusText}`,
              user: task.assigneeName || "Unknown User",
              role: "user",
              time: task.updatedAt,
              type: "updated",
              taskId: task._id
            });
          }
        });
        
        logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        const recentLogs = logs.slice(0, 15);
        setActivityLog(recentLogs);
        setStats(prev => ({
          ...prev,
          recentActivities: recentLogs.length
        }));
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  return {
    tasks,
    activityLog,
    loading,
    stats
  };
};