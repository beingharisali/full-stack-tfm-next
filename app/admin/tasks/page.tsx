"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAdminTasks } from "@/hooks/adminHook";
import { Task } from "@/services/task.api";
import ChatWidget from "@/app/component/ChatWidget";

import toast from "react-hot-toast";

export default function AdminTasksPage() {
  const { tasks, loading, fetchTasks, handleStatusChange, handleDeleteTask } = useAdminTasks();
  const router = useRouter();


  const handleEditClick = (task: Task) => {

  };

  const getStatusTagStyle = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityTagStyle = (priority?: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <>
      <div className='container mx-auto p-4 md:p-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-0'>
            Admin Task Management
          </h1>
          <div className='flex space-x-2'>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition'>
              Dashboard
            </button>
            <button
              onClick={() => router.push("/admin/workspaces")}
              className='px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition'>
              Manage Spaces
            </button>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-800'>All Tasks</h2>
              <p className='text-gray-600 mt-1'>Manage all tasks in the system</p>
            </div>
            
            {tasks.length === 0 ? (
              <div className='text-center py-12'>
                <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'></path>
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                  No Tasks Found
              </h3>
              <p className='text-gray-500'>
                There are currently no tasks in the system.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Task
                    </th>
                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Assignee
                    </th>
                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Due Date
                    </th>
                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Priority
                    </th>
                    <th scope='col' className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {tasks.map((task) => (
                    <tr key={task._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>{task.title}</div>
                        <div className='text-sm text-gray-500 line-clamp-2'>{task.description}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {task.assigneeName || "Unassigned"}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {task.assigneeEmail}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusTagStyle(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityTagStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleEditClick(task)}
                          className='text-indigo-600 hover:text-indigo-900 mr-3'>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id!)}
                          className='text-red-600 hover:text-red-900'>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
    <ChatWidget />
    </>
  );
}
