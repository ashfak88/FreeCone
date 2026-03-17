import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./config/passport"; // Import passport config
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import { getFreelancers } from "./controllers/userController";

dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // allow cookies to be sent from frontend
}));
app.use(express.json());
app.use(cookieParser());

// Session and Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "freecone_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware for logging
app.use((req, _res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), version: "FINAL_FIX" });
});

// Routes
app.get("/api/users/freelancers", getFreelancers);
app.use("/api/auth", authRoutes);

// Catch-all route for 404s
app.use((req, res) => {
  console.log(`[ROUTE NOT FOUND] ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Not Found", 
    path: req.url,
    message: "If you see this, the server IS RUNNING but this path is not defined." 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`   SERVER ACTIVE ON PORT ${PORT}      `);
  console.log("   DEBUG VERSION: 3                   ");
  console.log("========================================");
});
