"use client";

import { useAuthContext } from "@/context/AuthContext";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, X } from "lucide-react";

function Nav() {
  const { logoutUser } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function handleLogout() {
    try {
      await logoutUser();
      setShowLogoutModal(false);
    } catch (error) {
      console.log("Error occurred in logging out the user");
    }
  }

  return (
    <header className="bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-10 h-10 text-indigo-700 p-2 bg-white rounded-full"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="ml-3 text-2xl font-bold">TaskFlow</span>
        </a>

        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center"></nav>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="cursor-pointer inline-flex items-center bg-white text-indigo-700 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-50 rounded-lg font-semibold transition duration-200 mt-4 md:mt-0"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-gradient-to-br from-blue-600 to-blue-500 bg-opacity-95 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Confirm Logout</h2>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-white text-lg mb-8">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-white bg-opacity-80 backdrop-blur-sm text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Nav;
