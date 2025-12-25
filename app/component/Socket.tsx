"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/hooks/socketHook";
import { emitEvent, onEvent, offEvent } from "@/lib/socket.utils";

export default function SocketExample() {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    onEvent(socket, "message", handleMessage);

    return () => {
      offEvent(socket, "message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      emitEvent(socket, "message", inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Socket.io Example</h2>
        <p className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
          Status: {isConnected ? "Connected" : "Disconnected"}
        </p>
        {socket && (
          <p className="text-sm text-gray-600">Socket ID: {socket.id}</p>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded-lg h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-2 p-2 bg-white rounded">
              {msg}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !inputMessage.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
