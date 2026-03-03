import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();

/* ---------------- Middleware ---------------- */

app.use(
  cors({
    origin: "http://localhost:5173", // change if different
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- Routes ---------------- */

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

/* ---------------- DB Connection ---------------- */

pool
  .connect()
  .then(() => console.log("✅ Connected to Neon DB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

/* ---------------- Server Start ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});