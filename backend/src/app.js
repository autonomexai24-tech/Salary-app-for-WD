const express = require("express");
const cors = require("cors");
const departmentRoutes = require("./routes/department.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Health Check ----------
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Salary App backend is running" });
});

// ---------- Routes ----------
app.use("/api/departments", departmentRoutes);

// ---------- 404 Handler ----------
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------- Centralized Error Handler ----------
app.use(errorMiddleware);

module.exports = app;
