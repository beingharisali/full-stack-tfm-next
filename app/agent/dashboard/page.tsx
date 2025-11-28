"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/component/Navbar";
import ProtectedRoute from "@/shared/ProtectedRoute";
import { ArrowUp, ListChecks, Activity, Users, Clipboard, Clock, CheckCircle, Play, Calendar, AlertCircle, User, Crown, UserCircle } from "lucide-react";
import { getTasks, Task } from "@/services/task.api";

export default function page() {
	const router = useRouter();
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

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};

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
						<UserCircle className="w-3 h-3 mr-1" /> Agent
					</span>
				);
		}
	};

	return (
		<ProtectedRoute requiredRole="agent">
			<Nav />
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
								<Activity className="text-green-600" />
								Agent Dashboard
							</h1>
							<p className="text-gray-600 mt-2">Monitor all activities across the platform in real-time</p>
						</div>
						<button
							onClick={() => router.push("/activity")}
							className="flex items-center bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-semibold py-3 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-xl"
						>
							<ListChecks className="w-5 h-5 mr-2" />
							View Full Activity Log
						</button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">Total Tasks</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.totalTasks}</h3>
								</div>
								<div className="bg-green-100 p-3 rounded-full">
									<Clipboard className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">Pending</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.pendingTasks}</h3>
								</div>
								<div className="bg-yellow-100 p-3 rounded-full">
									<Clock className="w-6 h-6 text-yellow-600" />
								</div>
							</div>
						</div>

						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">In Progress</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.inProgressTasks}</h3>
								</div>
								<div className="bg-blue-100 p-3 rounded-full">
									<Play className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">Completed</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.completedTasks}</h3>
								</div>
								<div className="bg-purple-100 p-3 rounded-full">
									<CheckCircle className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</div>

						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">Overdue</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.overdueTasks}</h3>
								</div>
								<div className="bg-red-100 p-3 rounded-full">
									<AlertCircle className="w-6 h-6 text-red-600" />
								</div>
							</div>
						</div>

						<div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-600 text-sm font-medium">Activities</p>
									<h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '--' : stats.recentActivities}</h3>
								</div>
								<div className="bg-teal-100 p-3 rounded-full">
									<Activity className="w-6 h-6 text-teal-600" />
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<div 
								onClick={() => router.push("/tasks")}
								className="cursor-pointer"
							>
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center">
										<div className="bg-green-100 p-3 rounded-full mr-4">
											<Clipboard className="w-8 h-8 text-green-600" />
										</div>
										<div>
											<h2 className="text-2xl font-bold text-gray-800">Tasks Management</h2>
											<p className="text-gray-600">Manage and track all tasks with Kanban board</p>
										</div>
									</div>
									<div className="text-green-600">
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
											{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div 
											className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full" 
											style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
										></div>
									</div>
								</div>
								
								<div className="border-t border-gray-100 pt-4 mt-6">
									<p className="text-gray-600">Click here to view and manage all tasks</p>
								</div>
							</div>
						</div>
						
						<div className="flex flex-col items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
							<h3 className="text-xl font-bold text-gray-800 mb-4">Activity Log</h3>
							<button
								onClick={() => router.push("/activity")}
								className="flex flex-col items-center justify-center w-24 h-24 bg-green-100 rounded-full hover:bg-green-200 transition"
								aria-label="View Activity Log"
							>
								<Activity className="w-8 h-8 text-green-600" />
								<span className="mt-2 text-sm text-green-700 font-medium">View Log</span>
							</button>
						</div>
					</div>

					<div className="mt-8 bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white border-opacity-30">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
								<Activity className="text-green-600" />
								Recent Activities
							</h2>
							<button 
								onClick={() => router.push("/activity")}
								className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
							>
								View All
							</button>
						</div>
						
						{loading ? (
							<div className="flex justify-center items-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
							</div>
						) : activityLog.length === 0 ? (
							<div className="text-center py-12">
								<Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500">No recent activities found</p>
							</div>
						) : (
							<div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
								{activityLog.map((activity) => (
									<div 
										key={activity.id} 
										className="flex items-start gap-4 p-4 bg-white bg-opacity-50 rounded-xl border border-white border-opacity-50 hover:bg-opacity-70 transition-all"
									>
										<div className="mt-1">
											{getActivityIcon(activity.type)}
										</div>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2 mb-1">
												<p className="font-medium text-gray-800">{activity.user}</p>
												{getRoleBadge(activity.role)}
											</div>
											<p className="text-gray-700 mb-2">{activity.message}</p>
											<p className="text-xs text-gray-500 flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{new Date(activity.time).toLocaleString()}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<button
				onClick={scrollToTop}
				className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-teal-700 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-teal-800 transition-all duration-300 z-50"
				aria-label="Scroll to top"
			>
				<ArrowUp className="w-6 h-6" />
			</button>
		</ProtectedRoute>
	);
}