"use client";

import Nav from "@/app/component/Navbar";
import { getTasks, Task } from "@/services/task.api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { MdOutlineStarRate, MdOutlineWatchLater } from "react-icons/md";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, Clipboard, User, Crown, Calendar, CheckCircle, Play, Clock, AlertCircle } from "lucide-react";

function Page() {
  const router = useRouter();
  const [taskData, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function getTask() {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);

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
            taskId: task._id,
            taskTitle: task.title,
            taskStatus: task.status
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
            taskId: task._id,
            taskTitle: task.title,
            taskStatus: task.status
          });
        }
      });

      logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      setActivityLog(logs);
      setFilteredActivities(logs);
    } catch (err: any) {

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (filter === "all") {
      setFilteredActivities(activityLog);
    } else {
      setFilteredActivities(activityLog.filter(activity => activity.type === filter));
    }
  }, [filter, activityLog]);

  useEffect(() => {
    getTask();
  }, [refresh]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created": return <Clipboard className="w-5 h-5 text-blue-500" />;
      case "updated": return <Activity className="w-5 h-5 text-green-500" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": 
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Crown className="w-3 h-3 mr-1" /> Admin
          </span>
        );
      case "user": 
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <User className="w-3 h-3 mr-1" /> User
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User className="w-3 h-3 mr-1" /> Agent
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case "in progress":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      case "completed":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <>
      <Nav />

      <div className='mx-4 mt-6'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-blue-600 hover:text-blue-800 mb-6'>
          <ArrowLeft className='mr-2' />
          Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
              <Activity className="text-blue-600" />
              Activity Log
            </h2>
            <p className="text-gray-600 mt-1">Track all activities across the platform</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "all" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Activities
            </button>
            <button 
              onClick={() => setFilter("created")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                filter === "created" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Created
            </button>
            <button 
              onClick={() => setFilter("updated")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                filter === "updated" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Activity className="w-4 h-4" />
              Updated
            </button>
          </div>
        </div>

        {loading ? (
          <div className='p-12 bg-white bg-opacity-50 backdrop-blur-sm shadow-lg rounded-2xl text-center'>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className='p-12 bg-white bg-opacity-50 backdrop-blur-sm shadow-lg rounded-2xl text-center'>
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities found</h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "There are no activities to display yet." 
                : `There are no ${filter} activities to display.`}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white bg-opacity-50 backdrop-blur-sm shadow-lg rounded-2xl border border-white border-opacity-30 hover:shadow-xl transition-all'
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-medium text-gray-800">{activity.user}</p>
                      {getRoleBadge(activity.role)}
                    </div>
                    <p className="text-gray-700 mb-3">{activity.message}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Task: {activity.taskTitle}
                      </span>
                      {getStatusBadge(activity.taskStatus)}
                    </div>
                  </div>
                </div>
                <div className='text-right text-sm text-gray-500 min-w-max'>
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(activity.time).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Page;