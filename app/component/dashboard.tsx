"use client"
import { useState } from "react";
import { Menu, X, Home, BarChart2, Settings, User, Sidebar } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Overview", icon: <Home size={20} /> },
    { name: "Analytics", icon: <BarChart2 size={20} /> },
    { name: "Users", icon: <User size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r shadow-sm transform transition-transform duration-200 ease-in-out 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-xl font-semibold text-gray-700">My Dashboard</h2>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav className="mt-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>
          <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow">Widget 1</div>
            <div className="p-6 bg-white rounded-xl shadow">Widget 2</div>
            <div className="p-6 bg-white rounded-xl shadow">Widget 3</div>
          </div>

          <div className="mt-6 p-6 bg-white rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
            <p className="text-gray-600">This is your dashboard content area.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
