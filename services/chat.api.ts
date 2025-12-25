import http from "./http";

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  isRead: boolean;
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

export const sendPrivateMessage = async (senderId: string, recipientId: string, content: string) => {
  try {
    const response = await http.post("/chat/send", {
      senderId,
      receiverId: recipientId,
      message: content,
    });
    return response.data as ChatMessage;
  } catch (error) {

    throw error;
  }
};

export const getChatMessages = async (userId: string) => {
  try {
    const response = await http.get(`/chat/${userId}`);
    return response.data as ChatMessage[];
  } catch (error) {

    throw error;
  }
};

export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    const response = await http.delete(`/chat/${messageId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getOnlineUsers = async () => {
  try {
    const response = await http.get("/auth/online-users");
    return response.data.users as User[];
  } catch (error) {

    throw error;
  }
};