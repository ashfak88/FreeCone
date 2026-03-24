import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`   [SOCKET] New connection: ${socket.id}`);

    // Join a room based on userId when provided
    socket.on("join", (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`   [SOCKET] User ${userId} joined room ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`   [SOCKET] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Emit a notification to a specific user
 * @param userId - MongoDB User ID
 * @param event - Event name (e.g., 'newNotification', 'notificationUpdate')
 * @param data - Notification payload
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
    console.log(`   [SOCKET] Emitted ${event} to user ${userId}`);
  }
};
