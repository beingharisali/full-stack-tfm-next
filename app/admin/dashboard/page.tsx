"use client";
import Nav from "@/app/component/Navbar";
import { getTasks } from "@/services/task.api";
import { log } from "console";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { MdOutlineStarRate } from "react-icons/md";
import { MdOutlineWatchLater } from "react-icons/md";

function page() {
  const [taskData, setTaskData] = useState([]);
  async function getTask() {
    try {
      const task = await getTasks();
      console.log("tasks fetched successfully", task);
    } catch (error) {
      console.log("Error occured in fetching products");
    }
  }
  useEffect(() => {
    getTask();
  }, []);

  return (
    <>
      <Nav />
      <div className='flex justify-between mx-4'>
        <div>
          <button className='p-2 m-2 bg-blue-500 rounded-2xl text-white hover:bg-blue-400 active:bg-gray-200'>
            Recent <MdOutlineWatchLater className='inline' />
          </button>
          <button className='p-2 m-2 bg-blue-500 rounded-2xl text-white hover:bg-blue-400 active:bg-gray-200'>
            Favourite <MdOutlineStarRate className='inline' />
          </button>
          <button className='p-2 m-2 bg-blue-500 rounded-2xl text-white hover:bg-blue-400 active:bg-gray-200'>
            shared <IoMdShareAlt className='inline' />
          </button>
        </div>
        <Link href={"/tasks"}>
          <button className='p-2 m-2 bg-blue-500 rounded-2xl text-white hover:bg-blue-400'>
            Create Task
          </button>
        </Link>
      </div>
    </>
  );
}

export default page;
