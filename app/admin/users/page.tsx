"use client";

import React, { useState, useEffect } from "react";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { getAllUsers } from "@/services/auth.api";
import { User as UserIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch All Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  // Search Filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (u) =>
          u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // User and Agent Count (Merged from TFM Branch)
  const userCount = users.filter((u) => u.role === "user").length;
  const agentCount = users.filter((u) => u.role === "agent").length;

  if (authLoading || loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <Nav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-xl text-gray-700">Loading users...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Nav />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all registered users in the system</p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Users</h2>
              <p className="text-4xl font-bold text-blue-600">{userCount}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Total Agents</h2>
              <p className="text-4xl font-bold text-green-600">{agentCount}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm ? "No users found" : "No users available"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search" : "There are no users yet"}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-dashed border-white rounded-full w-12 h-12 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 flex justify-between items-center">
            <div>Showing {filteredUsers.length} of {users.length} users</div>
            <div>Total users: {users.length}</div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
