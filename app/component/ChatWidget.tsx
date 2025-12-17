"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import { MessageCircle, X, Send, User, Users, Trash2 } from "lucide-react";
import { 
  sendChatRequest as apiSendChatRequest, 
  respondToChatRequest, 
  sendPrivateMessage, 
  deleteMessage, 
  getUserChatRequests,
  getOnlineUsers as apiGetOnlineUsers
} from "../../services/chat.api";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  content: string;
  timestamp: Date;
  deleted?: boolean;
}

interface ChatRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}

interface ChatConnection {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Email: string;
  user2Email: string;
  createdAt: Date;
}

interface OnlineUser {
  id: string;
  name: string;
  role: string;
}

const ChatWidget: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<OnlineUser | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [chatConnections, setChatConnections] = useState<ChatConnection[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      console.log("Received message:", data);
      const message: Message = {
        id: data._id || Date.now().toString(),
        senderId: data.senderId,
        senderName: data.senderName,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: new Date(data.timestamp),
        deleted: data.deleted,
      };
      setMessages(prev => [...prev, message]);
    };

    const handlePrivateMessage = (data: any) => {
      console.log("Received private message:", data);
      const message: Message = {
        id: data._id || Date.now().toString(),
        senderId: data.senderId,
        senderName: data.senderName,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: new Date(data.timestamp),
        deleted: data.deleted,
      };
      setMessages(prev => [...prev, message]);
    };

    const handleChatRequest = (data: any) => {
      console.log("Received chat request:", data);
      const request: ChatRequest = {
        id: data._id || data.id,
        requesterId: data.requester,
        requesterName: data.requesterName,
        recipientId: data.recipient,
        recipientEmail: data.recipientEmail,
        status: data.status,
        timestamp: new Date(data.createdAt),
      };
      setChatRequests(prev => [...prev, request]);
    };

    const handleChatRequestResponse = (data: any) => {
      console.log("Received chat request response:", data);
      setChatRequests(prev => prev.map(req => 
        req.id === data.requestId ? {...req, status: data.status} : req
      ));
      
      if (data.status === 'accepted') {
        const connection: ChatConnection = {
          id: data.connectionId || Date.now().toString(),
          user1Id: data.user1Id || data.requesterId,
          user2Id: data.user2Id || data.recipientId,
          user1Email: data.user1Email || "",
          user2Email: data.user2Email || "",
          createdAt: new Date(data.createdAt || Date.now()),
        };
        setChatConnections(prev => [...prev, connection]);
      }
    };

    const handleNewConnection = (data: any) => {
      console.log("New connection established:", data);
      const connection: ChatConnection = {
        id: data.connectionId,
        user1Id: data.user1Id,
        user2Id: data.user2Id,
        user1Email: data.user1Email,
        user2Email: data.user2Email,
        createdAt: new Date(),
      };
      setChatConnections(prev => [...prev, connection]);
    };

    const handleUserOnline = (userId: string) => {
      console.log("User came online:", userId);
    };

    const handleUserOffline = (userId: string) => {
      console.log("User went offline:", userId);
    };

    const handleTyping = (data: any) => {
      if (data.senderId !== user?.id) {
        setTypingUser(data.senderName);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleChatRequestError = (data: any) => {
      console.log("Chat request error:", data);
      alert(data.message || "Error sending chat request");
    };

    socket.on("privateMessage", handlePrivateMessage);
    socket.on("message", handleMessage);
    socket.on("chatRequest", handleChatRequest);
    socket.on("chatRequestResponse", handleChatRequestResponse);
    socket.on("newConnection", handleNewConnection);
    socket.on("chatRequestError", handleChatRequestError);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("privateMessage", handlePrivateMessage);
      socket.off("message", handleMessage);
      socket.off("chatRequest", handleChatRequest);
      socket.off("chatRequestResponse", handleChatRequestResponse);
      socket.off("newConnection", handleNewConnection);
      socket.off("chatRequestError", handleChatRequestError);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing", handleTyping);
    };
  }, [socket, user?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeRecipient) return;

    const hasConnection = chatConnections.some(conn => 
      (conn.user1Id === user.id && conn.user2Id === activeRecipient.id) ||
      (conn.user2Id === user.id && conn.user1Id === activeRecipient.id)
    );
    
    const acceptedRequest = chatRequests.some(req => 
      req.requesterId === user.id && 
      req.recipientId === activeRecipient.id && 
      req.status === 'accepted'
    );
    
    if (!hasConnection && !acceptedRequest) {
      alert("You need to send a chat request and have it accepted before messaging this user.");
      return;
    }

    try {
      const result = await sendPrivateMessage(user.id, activeRecipient.id, newMessage);
      
      const message: Message = {
        id: result._id,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        recipientId: activeRecipient.id,
        content: newMessage,
        timestamp: new Date(result.createdAt),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");

      if (socket) {
        socket.emit("privateMessage", {
          _id: result._id,
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          recipientId: activeRecipient.id,
          content: newMessage,
          timestamp: new Date().toISOString(),
        });
      }

      if (socket) {
        socket.emit("typing", {
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          recipientId: activeRecipient.id,
          isTyping: false,
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleTypingIndicator = () => {
    if (!socket || !user || !activeRecipient) return;

    socket.emit("typing", {
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      recipientId: activeRecipient.id,
      isTyping: true,
    });
  };

  const sendChatRequest = async () => {
    if (!recipientEmail.trim() || !user) return;
    
    try {
      const existingRequest = chatRequests.find(req => 
        req.requesterId === user.id && 
        req.recipientEmail === recipientEmail && 
        (req.status === 'pending' || req.status === 'accepted')
      );
      
      if (existingRequest) {
        if (existingRequest.status === 'accepted') {
          alert("You are already connected with this user.");
        } else {
          alert("A chat request is already pending for this user.");
        }
        return;
      }
      
      const result = await apiSendChatRequest(user.id, `${user.firstName} ${user.lastName}`, recipientEmail);
      
      const request: ChatRequest = {
        id: result.chatRequest._id,
        requesterId: user.id,
        requesterName: `${user.firstName} ${user.lastName}`,
        recipientId: result.chatRequest.recipient,
        recipientEmail: recipientEmail,
        status: 'pending',
        timestamp: new Date(result.chatRequest.createdAt),
      };
      setChatRequests(prev => [...prev, request]);
      setRecipientEmail("");
      setShowEmailInput(false);
      alert("Chat request sent successfully!");
    } catch (error: any) {
      console.error("Error sending chat request:", error);
      alert(error.response?.data?.message || "Failed to send chat request");
    }
  };

  const handleRespondToChatRequest = async (requestId: string, response: 'accepted' | 'rejected') => {
    if (!user) return;
    
    try {
      const result = await respondToChatRequest(requestId, response, user.id);
      
      setChatRequests(prev => prev.map(req => 
        req.id === requestId ? {...req, status: response} : req
      ));
      
      if (response === 'accepted') {
        const request = chatRequests.find(req => req.id === requestId);
        if (request) {
          const connection: ChatConnection = {
            id: Date.now().toString(),
            user1Id: request.requesterId,
            user2Id: user.id,
            user1Email: request.requesterName,
            user2Email: `${user.firstName} ${user.lastName}`,
            createdAt: new Date(),
          };
          setChatConnections(prev => [...prev, connection]);
        }
      }
      
      if (socket) {
        socket.emit("chatRequestResponse", {
          requestId,
          status: response,
          responderId: user.id,
        });
      }
    } catch (error: any) {
      console.error("Error responding to chat request:", error);
      alert(error.response?.data?.message || `Failed to ${response} chat request`);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      const result = await deleteMessage(messageId, user.id);
      
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? {...msg, deleted: true} : msg
        ));
      } else {
        alert(result.message || "Failed to delete message");
      }
    } catch (error: any) {
      console.error("Error deleting message:", error);
      alert(error.response?.data?.message || "Failed to delete message");
    }
  };

  const deleteChat = async (recipientId: string) => {
    if (!user) return;
    
    try {
      setMessages(prev => prev.map(msg => 
        (msg.senderId === user?.id && msg.recipientId === recipientId) ||
        (msg.recipientId === user?.id && msg.senderId === recipientId)
          ? {...msg, deleted: true}
          : msg
      ));
      
      alert("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat");
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (user) {
      getUserChatRequests(user.id)
        .then(requests => {
          setChatRequests(requests.map(req => ({
            id: req._id,
            requesterId: req.requester._id,
            requesterName: `${req.requester.firstName} ${req.requester.lastName}`,
            recipientId: req.recipient._id,
            recipientEmail: req.recipientEmail,
            status: req.status,
            timestamp: new Date(req.createdAt),
          })));
        })
        .catch(error => {
          console.error("Error loading chat requests:", error);
        });
      
      apiGetOnlineUsers()
        .then(users => {
          setOnlineUsers(users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          })));
        })
        .catch(error => {
          console.error("Error loading online users:", error);
        });
    }
  }, [user]);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <MessageCircle size={24} />
        {messages.some(m => !m.recipientId) && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="mr-2" />
              <h3 className="font-bold">Team Chat</h3>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <Users size={16} className="mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Online Users</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((onlineUser) => (
                <button
                  key={onlineUser.id}
                  onClick={() => setActiveRecipient(onlineUser)}
                  className={`flex items-center px-2 py-1 rounded-full text-xs ${
                    activeRecipient?.id === onlineUser.id
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  {onlineUser.name}
                </button>
              ))}
            </div>
            
            {chatRequests.filter(req => req.recipientId === user?.id && req.status === 'pending').length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">Chat Requests</div>
                {chatRequests
                  .filter(req => req.recipientId === user?.id && req.status === 'pending')
                  .map(request => (
                    <div key={request.id} className="flex items-center justify-between bg-yellow-50 p-2 rounded mb-2">
                      <div className="text-xs">
                        <span className="font-medium">{request.requesterName}</span>
                        <span className="text-gray-600"> wants to chat</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRespondToChatRequest(request.id, 'accepted')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToChatRequest(request.id, 'rejected')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {message.senderId !== user?.id && (
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {message.senderName}
                        </div>
                      )}
                      {message.deleted ? (
                        <div className="italic text-gray-500">This message was deleted</div>
                      ) : (
                        <div>{message.content}</div>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <div
                          className={`text-xs ${
                            message.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {!message.deleted && message.senderId === user?.id && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-xs text-red-300 hover:text-white flex items-center"
                          >
                            <Trash2 size={12} className="mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {typingUser}
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            {activeRecipient && (
              <div className="text-sm text-gray-600 mb-2">
                Messaging: <span className="font-medium">{activeRecipient.name}</span>
                <button 
                  onClick={() => setActiveRecipient(null)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="flex mb-2">
              {showEmailInput ? (
                <div className="flex w-full gap-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter user email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendChatRequest}
                    disabled={!recipientEmail.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowEmailInput(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowEmailInput(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  Add User by Email
                </button>
              )}
            </div>
                          
            {activeRecipient && (
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">
                  Chatting with: <span className="font-medium">{activeRecipient.name}</span>
                </div>
                <button
                  onClick={() => deleteChat(activeRecipient.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete Chat
                </button>
              </div>
            )}
                          
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  } else {
                    handleTypingIndicator();
                  }
                }}
                placeholder={
                  activeRecipient 
                    ? `Message ${activeRecipient.name}...` 
                    : "Select a user to message..."
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!activeRecipient}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !activeRecipient}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;