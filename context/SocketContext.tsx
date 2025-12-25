"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});


interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const authContext = useContext(AuthContext);
    const user = authContext?.user;

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {

      setIsConnected(true);
      
      if (user?.id) {
        socketInstance.emit("join", user.id);

      }
    });

    socketInstance.on("disconnect", () => {

      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {

      setIsConnected(false);
    });

    socketInstance.on("notification", (notification) => {

    });

    setSocket(socketInstance);

    return () => {
      if (user?.id) {
        socketInstance.emit("leave", user.id);
      }
      socketInstance.disconnect();
      socketInstance.removeAllListeners();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};