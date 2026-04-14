import dotenv from "dotenv";
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


dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

connectDB();

app.use(cors({
  origin: ["https://free-cone-dv81.vercel.app", "https://freecone.duckdns.org", "http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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
);

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
