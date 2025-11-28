"use client";

import Nav from "@/app/component/Navbar";
import { getTasks, Task } from "@/services/task.api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { MdOutlineStarRate, MdOutlineWatchLater } from "react-icons/md";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function Page() {
  const router = useRouter();
  const [taskData, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);

  async function getTask() {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);

      const logs: any[] = [];

      fetchedTasks.forEach((task: Task) => {
        logs.push({
          message: `Task "${task.title}" was created by ${task.assigneeName}`,
          time: task.createdAt,
          type: "created",
        });

        if (task.updatedAt !== task.createdAt) {
          logs.push({
            message: `Task "${task.title}" was updated by ${task.assigneeName} and status changed to "${task.status}"`,
            time: task.updatedAt,
            type: "updated",
          });
        }
      });

      logs.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setActivityLog(logs.slice(0, 10));
    } catch (err: any) {
      console.log(
        err.response?.data?.message || err.message || "Failed to fetch tasks"
      );
    }
  }

  useEffect(() => {
    getTask();
  }, [refresh]);

  return (
    <>
      <Nav />

      <div className='mx-4 mt-6'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-blue-600 hover:text-blue-800 mb-4'>
          <ArrowLeft className='mr-2' />
          Back
        </button>

        <h2 className='text-3xl font-bold text-gray-800 mb-4'>Activity Log</h2>

        {activityLog.length === 0 ? (
          <div className='p-6 bg-white shadow-lg rounded-xl text-center text-gray-500'>
            No recent activity found.
          </div>
        ) : (
          <div className='space-y-4'>
            {activityLog.map((activity, index) => (
              <div
                key={index}
                className='flex justify-between items-start p-4 bg-white shadow-lg rounded-xl hover:shadow-2xl transition'>
                <div>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                      activity.type === "created"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                    {activity.type.toUpperCase()}
                  </span>
                  <p className='mt-2 text-gray-800 text-sm'>
                    {activity.message}
                  </p>
                </div>
                <div className='text-right text-xs text-gray-500'>
                  {new Date(activity.time).toLocaleString()}
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
