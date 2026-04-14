import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
  const allowedOrigins = [
    "https://freecone.duckdns.org",
    "https://free-cone-dv81.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`   [SOCKET] New connection: ${socket.id}`);

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
