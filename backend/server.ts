import dotenv from "dotenv";

dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./config/passport";
import connectDB from "./config/db";
import { initSocket } from "./config/socket";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { checkMaintenance } from "./middleware/maintenanceMiddleware";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import jobRoutes from "./routes/jobRoutes";
import offerRoutes from "./routes/offerRoutes";
import uploadRoutes from "./routes/uploadRoute";
import notificationRoutes from "./routes/notificationRoutes";
import messageRoutes from "./routes/messageRoutes";
import miscRoutes from "./routes/miscRoutes";
import adminRoutes from "./routes/adminRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import configRoutes from "./routes/configRoutes";



const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);

initSocket(server);

connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://free-cone.vercel.app",
  "https://free-cone-dv81.vercel.app",
  "https://freecone.duckdns.org",
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, "").trim();
    
    const isAllowed = allowedOrigins.some(allowed => 
      allowed.toLowerCase().replace(/\/$/, "").trim() === normalizedOrigin
    ) || normalizedOrigin.endsWith(".vercel.app");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`   [CORS] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "freecone_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(loggerMiddleware);
app.use(checkMaintenance);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", miscRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/config", configRoutes);

app.get("/api/test-admin", (req, res) => res.json({ message: "Admin space is reachable" }));


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`   SERVER ACTIVE ON PORT ${PORT}`);
});