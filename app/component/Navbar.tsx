"use client";

import { useAuthContext } from "@/context/AuthContext";
import { getTasks, Task } from "@/services/task.api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LogOut, X, Bell, ListChecks } from "lucide-react";

function Nav() {
  const { logoutUser } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const notifications = [
    "New task has been assigned",
    "Your project deadline is tomorrow",
    "Dashboard report updated",
  ];

  async function handleLogout() {
    try {
      await logoutUser();
      setShowLogoutModal(false);
    } catch (error) {
      console.log("Error occurred in logging out the user");
    }
  }

  // Fetch tasks and build activity log
  async function fetchActivities() {
    try {
      const tasks: Task[] = await getTasks();
      const logs: any[] = [];

      tasks.forEach((task: Task) => {
        logs.push({
          message: `Task "${task.title}" was created by ${task.assigneeName}`,
          time: task.createdAt,
          type: "created",
          taskId: task._id,
        });

        if (task.updatedAt !== task.createdAt) {
          logs.push({
            message: `Task "${task.title}" was updated by ${task.assigneeName} and status changed to "${task.status}"`,
            time: task.updatedAt,
            type: "updated",
            taskId: task._id,
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
    fetchActivities();
  }, []);

  return (
    <header className='bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg relative'>
      <div className='container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center'>
        <Link
          href={"/tasks"}
          className='flex title-font font-medium items-center text-white mb-4 md:mb-0 cursor-pointer'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='w-10 h-10 text-indigo-700 p-2 bg-white rounded-full'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
            />
          </svg>
          <span className='ml-3 text-2xl font-bold'>TaskFlow</span>
        </Link>

        <nav className='md:ml-auto flex items-center gap-6'>
          {/* Notifications */}
          <div className='relative'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative cursor-pointer bg-white text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition'>
              <Bell className='w-5 h-5' />
              <span className='absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full'></span>
            </button>
            {showNotifications && (
              <div className='absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-4 text-black z-50'>
                <h3 className='font-bold text-lg mb-3'>Notifications</h3>
                {notifications.length > 0 ? (
                  notifications.map((note, index) => (
                    <div
                      key={index}
                      className='p-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition'>
                      {note}
                    </div>
                  ))
                ) : (
                  <p className='text-gray-600'>No new notifications</p>
                )}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className='relative'>
            <button
              onClick={() => {
                setShowActivities(!showActivities);
                if (!showActivities) fetchActivities(); // refresh on open
              }}
              className='relative cursor-pointer bg-white text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition'>
              <ListChecks className='w-5 h-5' />
            </button>
            {showActivities && (
              <div className='absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-4 text-black z-50'>
                <h3 className='font-bold text-lg mb-3'>Activity Log</h3>
                {activityLog.length > 0 ? (
                  activityLog.map((act, index) => (
                    <Link
                      key={index}
                      href={`/activity`}
                      className='block p-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm'>
                      {act.message}
                      <div className='text-xs text-gray-500'>
                        {new Date(act.time).toLocaleString()}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className='text-gray-600'>No recent activity</p>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className='cursor-pointer inline-flex items-center bg-white text-indigo-700 py-2 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition'>
            <LogOut className='w-5 h-5 mr-2' />
            Logout
          </button>
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md'
          onClick={() => setShowLogoutModal(false)}>
          <div
            className='bg-linear-to-br from-blue-600 to-blue-500 bg-opacity-95 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4'
            onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-white'>Confirm Logout</h2>
              <button
                onClick={() => setShowLogoutModal(false)}
                className='text-white hover:text-gray-200'>
                <X className='w-6 h-6' />
              </button>
            </div>

            <p className='text-white text-lg mb-8'>
              Are you sure you want to logout?
            </p>

            <button
              onClick={handleLogout}
              className='w-full px-6 py-3 bg-white bg-opacity-80 text-black font-semibold rounded-lg hover:bg-gray-100 transition'>
              Yes
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Nav;
