"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/socketHook";

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any; // Allow additional properties
}

export default function OnlineUsers() {
  const { socket } = useSocket();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (socket) {
      const handleOnlineUsers = (data: User[]) => {
        setUsers(data);
      };
      
      socket.on("onlineUsers", handleOnlineUsers);
      
      return () => {
        socket.off("onlineUsers", handleOnlineUsers);
      };
    }
  }, [socket]);

  return (
    <div className="text-xs text-green-600">
      Online Users: {users.length}
    </div>
  );
}