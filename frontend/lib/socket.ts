import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5001";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  public connect(): Socket {
    if (!this.socket) {
      console.log("   [SOCKET] Initializing socket connection to:", SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("   [SOCKET] Connected to server. ID:", this.socket?.id);
        if (this.userId) {
          console.log("   [SOCKET] Re-joining room:", this.userId);
          this.socket?.emit("join", this.userId);
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("   [SOCKET] Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("   [SOCKET] Connection Error:", error.message);
      });
    }
    return this.socket;
  }

  public joinRoom(userId: string): void {
    this.userId = userId;
    if (this.socket?.connected) {
      console.log("   [SOCKET] Joining room now:", userId);
      this.socket.emit("join", userId);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
