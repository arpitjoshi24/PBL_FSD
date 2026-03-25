import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();

/* ---------------- Middleware ---------------- */

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});


pool
  .connect()
  .then(() => console.log("✅ Connected to Neon DB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use("/api/projects", projectRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});