import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./config/passport";
import connectDB from "./config/db";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import jobRoutes from "./routes/jobRoutes";
import offerRoutes from "./routes/offerRoutes";
import uploadRoutes from "./routes/uploadRoute";

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
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

app.get("/api/ping", (req, res) => {
  res.send("pong " + new Date().toISOString());
});

app.get("/api/test-users", async (req, res) => {
  try {
    const User = (await import("./models/User")).default;
    const users = await User.find({});
    res.json({ count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/upload", uploadRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`   SERVER ACTIVE ON PORT ${PORT}`);
});
