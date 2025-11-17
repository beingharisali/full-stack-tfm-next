import { useAuthContext } from "@/context/AuthContext";
import { log } from "console";
import React from "react";
import toast from "react-hot-toast";

function Nav() {
	const { logoutUser } = useAuthContext();
	async function logout() {
		try {
			const confirm = window.confirm("Are you sure! you want to logout??");
			if (confirm) {
				await logoutUser();
				console.log("User logged out successfully");
				toast.success("user logged out successfully");
			}
		} catch (error) {
			console.log("Error occured in logging out the user ");
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
						viewBox="0 0 24 24">
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
					onClick={logout}
					className="cursor-pointer inline-flex items-center bg-white text-indigo-700 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-50 rounded-lg font-semibold transition duration-200 mt-4 md:mt-0">
					<svg
						className="w-5 h-5 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Logout
				</button>
			</div>
		</header>
	);
}

export default Nav;
