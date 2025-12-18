"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut, Bell, X, User } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/services/notification.api";
import { useRouter } from "next/navigation";

function Nav() {
  const { logoutUser, user } = useAuthContext();
  const { socket } = useSocket();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "New task assigned: Design Dashboard",
    "Task updated: Fix Login Bug",
  ]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    try {
      await logoutUser();
      setShowLogoutModal(false);
    } catch (error) {

    }
  }

  const fetchUnreadNotificationCount = async () => {
    if (user?.id) {
      try {
        const count = await getUnreadNotificationCount(user.id);
        setHasUnreadNotifications(count > 0);
      } catch (error) {
        
      }
    }
  };

  const markNotificationsAsRead = async () => {
    if (user?.id) {
      try {
        await markAllNotificationsAsRead(user.id);
        setHasUnreadNotifications(false);
      } catch (error) {
        
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification: any) => {
        setHasUnreadNotifications(true);
      };

      socket.on("notification", handleNewNotification);

      return () => {
        socket.off("notification", handleNewNotification);
      };
    }
  }, [socket]);

  const handleNotificationToggle = () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);

    if (newShowState && hasUnreadNotifications) {
      markNotificationsAsRead();
    }
  };

  const handleProfileToggle = () => {
    setShowProfileModal(!showProfileModal);
  };

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
          <div
            className='relative'
            ref={notificationRef}>
            <button
              onClick={handleNotificationToggle}
              className='relative cursor-pointer bg-white text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition'>
              <Bell className='w-5 h-5' />
              {hasUnreadNotifications && (
                <span className='absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full'></span>
              )}
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

          <div className='relative' ref={profileRef}>
            <button
              onClick={handleProfileToggle}
              className='cursor-pointer bg-white text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition'
              aria-label="View Profile">
              <User className='w-5 h-5' />
            </button>
            
            {showProfileModal && (
              <div className='absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-6 text-black z-50'>
                <div className='flex items-center mb-6'>
                  <div className='bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16' />
                  <div className='ml-4'>
                    <h3 className='font-bold text-lg'>
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className='text-gray-600'>{user?.email}</p>
                    <span className='inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1'>
                      {user?.role}
                    </span>
                  </div>
                </div>
                
                <div className='border-t border-gray-200 pt-4'>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      router.push("/profile");
                    }}
                    className='w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition'>
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className='cursor-pointer inline-flex items-center bg-white text-indigo-700 py-2 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition'>
            <LogOut className='w-5 h-5 mr-2' />
            Logout
          </button>
        </nav>
      </div>

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