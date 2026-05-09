import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path'; // Add this if not imported
import { fileURLToPath } from 'url'; // Add this for ES Modules

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";

import pool from "./config/db.js";

dotenv.config();

const app = express();

// --- GLOBAL CRASH SAFETY ---
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

// --- ADD THESE LINES RIGHT HERE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This line tells Express: "If anyone asks for /uploads, look in the /uploads folder"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MIDDLEWARE ---
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/invites", inviteRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- DB HEALTH CHECK (optional but recommended) ---
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB Ready");
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
})();

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});