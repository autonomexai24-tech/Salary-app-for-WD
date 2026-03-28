const express = require("express");
const cors = require("cors");
const app = express();

const departmentRoutes = require("./routes/department.routes");
const errorMiddleware = require("./middlewares/error.middleware");

// Global Middleware
app.use(cors());
app.use(express.json());

// ✅ CORRECT BASE PATH
app.use("/api/departments", departmentRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

// Centralized Error Handler
app.use(errorMiddleware);

module.exports = app;
