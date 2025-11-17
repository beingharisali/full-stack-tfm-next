import { Socket } from "socket.io-client";

export const emitEvent = (socket: Socket | null, event: string, data?: any) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn("Socket is not connected. Cannot emit event:", event);
  }
};

export const onEvent = (socket: Socket | null, event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (socket: Socket | null, event: string) => {
  if (socket) {
    socket.off(event);
  }
};

export const joinRoom = (socket: Socket | null, roomId: string) => {
  emitEvent(socket, "join", roomId);
};

export const sendMessage = (socket: Socket | null, message: any) => {
  emitEvent(socket, "message", message);
};
