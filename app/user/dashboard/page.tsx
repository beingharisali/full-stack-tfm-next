"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function page() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<h1 className="text-4xl font-bold text-gray-800 mb-8">User Dashboard</h1>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div
					onClick={() => router.push("/tasks")}
					className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-l-4 border-blue-600"
				>
					<div className="flex items-center justify-between mb-4">
						<div className="bg-blue-100 p-3 rounded-lg">
							<svg
								className="w-8 h-8 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
						</div>
						<svg
							className="w-6 h-6 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-2">Tasks Management</h2>
					<p className="text-gray-600 mb-4">
						Manage and track all your tasks with Kanban board
					</p>
					<div className="flex items-center text-blue-600 font-semibold">
						<span>View Tasks</span>
						<svg
							className="w-4 h-4 ml-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}
