"use client";
import { useEffect, useState } from "react";
import socket from "@/utils/socket";
import axios from "@/utils/axios";

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  [key: string]: any;
}

interface Message {
  _id: string;
  sender: string;
  message: string;
  isEdited?: boolean;
  isRead?: boolean;
  createdAt?: string;
  [key: string]: any; 
}

interface ChatBoxProps {
  currentUser: User;
  receiver: User;
  workspaceId: string;
}

export default function ChatBox({ currentUser, receiver, workspaceId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  /* ===== JOIN SOCKET ===== */
  useEffect(() => {
    socket.emit("join", currentUser._id);

    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    socket.on("messageSeen", () => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, isRead: true }))
      );
    });

    return () => {
      socket.off();
    };
  }, []);

  /* ===== LOAD CHAT ===== */
  useEffect(() => {
    axios
      .get(`/chat/${workspaceId}/${receiver._id}`)
      .then((res) => setMessages(res.data));
  }, [receiver]);

  /* ===== SEND ===== */
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await axios.post("/chat/send", {
      receiverId: receiver._id,
      workspaceId,
      message: text,
    });

    socket.emit("privateMessage", {
      sender: currentUser._id,
      receiver: receiver._id,
      message: text,
    });

    setMessages([...messages, res.data]);
    setText("");
    socket.emit("stopTyping", { receiverId: receiver._id });
  };

  /* ===== EDIT ===== */
  const editMessage = async (id: string) => {
    const newText = prompt("Edit message");
    if (!newText) return;

    const res = await axios.put(`/chat/${id}`, {
      message: newText,
    });

    setMessages(messages.map((m) => (m._id === id ? res.data : m)));
  };

  /* ===== DELETE ===== */
  const deleteMessage = async (id: string) => {
    await axios.delete(`/chat/${id}`);
    setMessages(messages.filter((m) => m._id !== id));
  };

  /* ===== SEARCH ===== */
  const filteredMessages = messages.filter((m) =>
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white shadow-xl rounded-lg flex flex-col">
      <div className="p-3 border-b font-bold flex justify-between">
        {receiver.name || `${receiver.firstName} ${receiver.lastName}`}
        <input
          placeholder="Search"
          className="border px-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredMessages.map((m) => (
          <div
            key={m._id}
            className={`mb-2 ${
              m.sender === currentUser._id ? "text-right" : "text-left"
            }`}
          >
            <div className="inline-block bg-gray-200 p-2 rounded">
              {m.message}
              {m.isEdited && (
                <span className="text-xs ml-1">(edited)</span>
              )}
            </div>

            {m.sender === currentUser._id && (
              <div className="text-xs">
                {m.isRead ? "✔✔ Seen" : "✔ Sent"}
              </div>
            )}

            {m.sender === currentUser._id && (
              <div className="text-xs">
                <button onClick={() => editMessage(m._id)}>Edit</button>
                <button
                  className="ml-2"
                  onClick={() => deleteMessage(m._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="text-sm italic">Typing...</div>
        )}
      </div>

      <div className="p-2 border-t flex">
        <input
          className="flex-1 border p-2"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", {
              senderId: currentUser._id,
              receiverId: receiver._id,
            });
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
}