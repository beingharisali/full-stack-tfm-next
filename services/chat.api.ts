import http from "./http";

export interface ChatRequest {
  _id: string;
  requester: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipientEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const sendChatRequest = async (requesterId: string, requesterName: string, recipientEmail: string) => {
  try {
    const response = await http.post("/chat/request", {
      requesterId,
      requesterName,
      recipientEmail,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending chat request:", error);
    throw error;
  }
};


export const respondToChatRequest = async (requestId: string, status: "accepted" | "rejected", responderId: string) => {
  try {
    const response = await http.post("/chat/request/respond", {
      requestId,
      status,
      responderId,
    });
    return response.data;
  } catch (error) {
    console.error("Error responding to chat request:", error);
    throw error;
  }
};

export const getUserChatRequests = async (userId: string) => {
  try {
    const response = await http.get(`/chat/requests/${userId}`);
    return response.data.chatRequests as ChatRequest[];
  } catch (error) {
    console.error("Error fetching chat requests:", error);
    throw error;
  }
};

export const sendPrivateMessage = async (senderId: string, recipientId: string, content: string) => {
  try {
    const response = await http.post("/chat/message", {
      senderId,
      recipientId,
      content,
    });
    return response.data.chatMessage as ChatMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getChatMessages = async (user1Id: string, user2Id: string) => {
  try {
    const response = await http.get(`/chat/messages/${user1Id}/${user2Id}`);
    return response.data.messages as ChatMessage[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    const response = await http.delete(`/chat/message/${messageId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const getOnlineUsers = async () => {
  try {
    const response = await http.get("/auth/online-users");
    return response.data.users as User[];
  } catch (error) {
    console.error("Error fetching online users:", error);
    throw error;
  }
};