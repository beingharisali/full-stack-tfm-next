"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";
import ChatWidget from "@/app/component/ChatWidget";
import { ArrowUp, ListChecks, Clipboard, Clock, CheckCircle, Play, Calendar, User, Folder } from "lucide-react";
import { getTasks, Task } from "@/services/task.api";

export default function page() {
	const router = useRouter();
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

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};

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

	return (
		<ProtectedRoute requiredRole="user">
			<Nav />
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold text-gray-800">User Dashboard</h1>
							<p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your tasks today.</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => router.push("/user/spaces")}
								className="flex items-center bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md"
							>
								<Folder className="w-5 h-5 mr-2" />
								My Spaces
							</button>
							<button
								onClick={() => router.push("/activity")}
								className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md"
							>
								<ListChecks className="w-5 h-5 mr-2" />
								Activity Log
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">Total Tasks</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.total}</h3>
								</div>
								<div className="bg-blue-100 p-3 rounded-lg">
									<Clipboard className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">Pending</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.pending}</h3>
								</div>
								<div className="bg-yellow-100 p-3 rounded-lg">
									<Clock className="w-6 h-6 text-yellow-600" />
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">In Progress</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.inProgress}</h3>
								</div>
								<div className="bg-indigo-100 p-3 rounded-lg">
									<Play className="w-6 h-6 text-indigo-600" />
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">Completed</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.completed}</h3>
								</div>
								<div className="bg-green-100 p-3 rounded-lg">
									<CheckCircle className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">Completed Today</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.completedToday}</h3>
								</div>
								<div className="bg-teal-100 p-3 rounded-lg">
									<CheckCircle className="w-6 h-6 text-teal-600" />
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-500 text-sm font-medium">Overdue</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.overdue}</h3>
								</div>
								<div className="bg-red-100 p-3 rounded-lg">
									<Calendar className="w-6 h-6 text-red-600" />
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
						<div 
							onClick={() => router.push("/tasks")}
							className="cursor-pointer"
						>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center">
									<div className="bg-blue-100 p-3 rounded-lg mr-4">
										<Clipboard className="w-8 h-8 text-blue-600" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-gray-800">Tasks Management</h2>
										<p className="text-gray-600">Manage and track all your tasks with Kanban board</p>
									</div>
								</div>
								<div className="text-blue-600">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</div>
							
							<div className="mt-6">
								<div className="flex justify-between mb-2">
									<span className="text-gray-700 font-medium">Task Completion</span>
									<span className="text-gray-700 font-medium">
										{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div 
										className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
										style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
									></div>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-6">
						<h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tasks</h2>
						{loading ? (
							<div className="text-center py-8">
								<div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
								<p className="mt-2 text-gray-600">Loading tasks...</p>
							</div>
						) : tasks.length === 0 ? (
							<div className="text-center py-8">
								<div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
									<Clipboard className="w-8 h-8 text-gray-400" />
								</div>
								<p className="mt-4 text-gray-600">No tasks found</p>
								<button 
									onClick={() => router.push("/tasks")}
									className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
								>
									Create your first task
								</button>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{tasks.slice(0, 3).map((task) => (
									<div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
										<div className="flex justify-between items-start">
											<h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												task.status === "completed" 
													? "bg-green-100 text-green-800" 
													: task.status === "in progress" 
														? "bg-blue-100 text-blue-800" 
														: "bg-yellow-100 text-yellow-800"
											}`}>
												{task.status}
											</span>
										</div>
										<p className="text-gray-600 text-sm mt-2 truncate">{task.description}</p>
										{task.dueDate && (
											<div className="flex items-center mt-3 text-sm text-gray-500">
												<Calendar className="w-4 h-4 mr-1" />
												<span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
											</div>
										)}
									</div>
								))}
								{tasks.length > 3 && (
									<div 
										onClick={() => router.push("/tasks")}
										className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
									>
										<span className="text-blue-600 font-medium">View all {tasks.length} tasks</span>
										<svg
											className="w-5 h-5 text-blue-600 mt-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<button
				onClick={scrollToTop}
				className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 z-40"
				aria-label="Scroll to top"
			>
				<ArrowUp className="w-6 h-6" />
			</button>
			<ChatWidget />
		</ProtectedRoute>
	);
}